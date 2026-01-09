require 'rails_helper'

RSpec.describe Insights::NativeSurveyPhaseInsightsService do
  let(:service) { described_class.new(phase) }
  let(:phase) { create(:native_survey_phase, start_at: 17.days.ago, end_at: 2.days.ago) }

  let(:user1) { create(:user) }
  let!(:idea1) { create(:idea, phases: [phase], created_at: 20.days.ago, submitted_at: 20.days.ago, author: user1, creation_phase_id: phase.id) } # before phase start
  let!(:idea2) { create(:idea, phases: [phase], created_at: 10.days.ago, submitted_at: 10.days.ago, author: user1, creation_phase_id: phase.id) } # during phase
  let!(:idea3) { create(:idea, phases: [phase], created_at: 1.day.ago, submitted_at: 1.day.ago, author: user1, creation_phase_id: phase.id) } # after phase end

  let(:user2) { create(:user) }
  let!(:idea4) { create(:idea, phases: [phase], created_at: 10.days.ago, submitted_at: 10.days.ago, author: user2, creation_phase_id: phase.id) } # during phase
  let!(:idea5) do
    create(
      :idea,
      phases: [phase],
      created_at: 10.days.ago,
      submitted_at: nil,
      author: user2,
      publication_status: 'draft', # to avoid automatic setting of submitted_at
      creation_phase_id: phase.id
    ) # created during phase, but not submitted
  end

  let!(:idea6) { create(:idea, phases: [phase], created_at: 10.days.ago, submitted_at: 10.days.ago, author: nil, author_hash: 'some_author_hash', creation_phase_id: phase.id) } # during phase, no author (e.g. anonymous participation)
  let!(:idea7) { create(:idea, phases: [phase], created_at: 10.days.ago, submitted_at: 10.days.ago, author: nil, author_hash: nil, creation_phase_id: phase.id) } # during phase, no author nor author_hash (e.g. imported idea)

  describe '#participations_posting_idea' do
    it 'returns the participation ideas posted data for non-transitive ideas created during phase' do
      participations_posting_idea = service.send(:participations_posting_idea)

      expect(participations_posting_idea).to contain_exactly({
        item_id: idea2.id,
        action: 'posting_idea',
        acted_at: a_kind_of(Time),
        classname: 'Idea',
        survey_submitted_at: idea2.submitted_at,
        participant_id: user1.id,
        user_custom_field_values: {}
      }, {
        item_id: idea4.id,
        action: 'posting_idea',
        acted_at: a_kind_of(Time),
        classname: 'Idea',
        survey_submitted_at: idea4.submitted_at,
        participant_id: user2.id,
        user_custom_field_values: {}
      }, {
        item_id: idea5.id,
        action: 'posting_idea',
        acted_at: a_kind_of(Time),
        classname: 'Idea',
        survey_submitted_at: nil,
        participant_id: user2.id,
        user_custom_field_values: {}
      }, {
        item_id: idea6.id,
        action: 'posting_idea',
        acted_at: a_kind_of(Time),
        classname: 'Idea',
        survey_submitted_at: idea6.submitted_at,
        participant_id: 'some_author_hash',
        user_custom_field_values: {}
      }, {
        item_id: idea7.id,
        action: 'posting_idea',
        acted_at: a_kind_of(Time),
        classname: 'Idea',
        survey_submitted_at: idea7.submitted_at,
        participant_id: idea7.id,
        user_custom_field_values: {}
      })

      first_participation = participations_posting_idea.first
      expect(first_participation[:acted_at])
        .to be_within(1.second).of(Idea.find(first_participation[:item_id]).created_at)
    end

    it 'correctly handles phases with no end date' do
      phase.update!(end_at: nil)
      participations_posting_idea = service.send(:participations_posting_idea)

      expect(participations_posting_idea.pluck(:item_id)).to contain_exactly(idea2.id, idea3.id, idea4.id, idea5.id, idea6.id, idea7.id)
    end

    it 'includes draft ideas' do
      participations_posting_idea = service.send(:participations_posting_idea)

      idea_ids = participations_posting_idea.map { |p| p[:item_id] }
      expect(idea_ids).to include(idea5.id)
    end

    it 'does not include transitive ideas' do
      idea2.creation_phase_id = nil
      idea2.save!(validate: false) # skip validations to allow setting as transitive idea
      participations_posting_idea = service.send(:participations_posting_idea)

      idea_ids = participations_posting_idea.map { |p| p[:item_id] }
      expect(idea_ids).not_to include(idea2.id)
    end
  end

  describe '#phase_participations' do
    it 'returns the expected aggregation of sets of participations' do
      participations = service.send(:phase_participations)

      expect(participations).to eq({
        posting_idea: service.send(:participations_posting_idea)
      })

      expect(participations[:posting_idea].map { |p| p[:item_id] }).to contain_exactly(idea2.id, idea4.id, idea5.id, idea6.id, idea7.id)
    end
  end

  describe 'phase_participation_method_metrics' do
    let(:user1) { create(:user) }
    let(:participation1) { create(:posting_idea_participation, acted_at: 10.days.ago, user: user1) }
    let(:participation2) { create(:posting_idea_participation, acted_at: 5.days.ago, user: user1) }

    it 'calculates the correct metrics' do
      participation1[:survey_submitted_at] = 10.days.ago
      participation2[:survey_submitted_at] = 5.days.ago
      participations = { posting_idea: [participation1, participation2] }

      metrics = service.send(:phase_participation_method_metrics, participations)

      expect(metrics).to eq({
        surveys_submitted: 2,
        surveys_submitted_7_day_change: 0.0, # from 1 (in week before last) to 1 (in last 7 days) = 0% change
        completion_rate: 1.0,
        completion_rate_7_day_change: 0.0 # completion_rate_last_7_days: 1.0, completion_rate_previous_7_days: 1.0 = 0% change
      })
    end
  end
end
