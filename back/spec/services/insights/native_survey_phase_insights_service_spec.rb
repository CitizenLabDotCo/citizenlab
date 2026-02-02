require 'rails_helper'

RSpec.describe Insights::NativeSurveyPhaseInsightsService do
  let(:service) { described_class.new(phase) }
  let(:phase) { create(:native_survey_phase, start_at: 17.days.ago, end_at: 2.days.ago) }

  let(:user1) { create(:user) }
  let!(:idea1) { create(:idea, phases: [phase], created_at: 20.days.ago, submitted_at: 20.days.ago, author: user1, creation_phase_id: phase.id) } # before phase start (should still be included)
  let!(:idea2) { create(:idea, phases: [phase], created_at: 10.days.ago, submitted_at: 10.days.ago, author: user1, creation_phase_id: phase.id) } # during phase, in week before last
  let!(:idea3) { create(:idea, phases: [phase], created_at: 1.day.ago, submitted_at: 1.day.ago, author: user1, creation_phase_id: phase.id) } # after phase end (should still be included)

  let(:user2) { create(:user) }
  let!(:idea4) { create(:idea, phases: [phase], created_at: 5.days.ago, submitted_at: 5.days.ago, author: user2, creation_phase_id: phase.id) } # during phase, in last 7 days
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

  describe '#participations_submitting_idea' do
    it 'returns the participation ideas posted data for non-transitive ideas created during phase' do
      participations_submitting_idea = service.send(:participations_submitting_idea)

      expect(participations_submitting_idea).to contain_exactly({
        item_id: idea1.id,
        action: 'submitting_idea',
        acted_at: a_kind_of(Time),
        classname: 'Idea',
        participant_id: user1.id,
        user_custom_field_values: {}
      }, {
        item_id: idea2.id,
        action: 'submitting_idea',
        acted_at: a_kind_of(Time),
        classname: 'Idea',
        participant_id: user1.id,
        user_custom_field_values: {}
      }, {
        item_id: idea3.id,
        action: 'submitting_idea',
        acted_at: a_kind_of(Time),
        classname: 'Idea',
        participant_id: user1.id,
        user_custom_field_values: {}
      }, {
        item_id: idea4.id,
        action: 'submitting_idea',
        acted_at: a_kind_of(Time),
        classname: 'Idea',
        participant_id: user2.id,
        user_custom_field_values: {}
      }, {
        item_id: idea6.id,
        action: 'submitting_idea',
        acted_at: a_kind_of(Time),
        classname: 'Idea',
        participant_id: 'some_author_hash',
        user_custom_field_values: {}
      }, {
        item_id: idea7.id,
        action: 'submitting_idea',
        acted_at: a_kind_of(Time),
        classname: 'Idea',
        participant_id: idea7.id,
        user_custom_field_values: {}
      })

      first_participation = participations_submitting_idea.first
      expect(first_participation[:acted_at])
        .to be_within(1.second).of(Idea.find(first_participation[:item_id]).created_at)
    end

    it 'correctly handles phases with no end date' do
      phase.update!(end_at: nil)
      participations_submitting_idea = service.send(:participations_submitting_idea)

      expect(participations_submitting_idea.pluck(:item_id)).to contain_exactly(idea1.id, idea2.id, idea3.id, idea4.id, idea6.id, idea7.id)
    end

    it 'does not include draft ideas' do
      participations_submitting_idea = service.send(:participations_submitting_idea)

      idea_ids = participations_submitting_idea.map { |p| p[:item_id] }
      expect(idea_ids).not_to include(idea5.id)
    end

    it 'does not include transitive ideas' do
      idea2.creation_phase_id = nil
      idea2.save!(validate: false) # skip validations to allow setting as transitive idea
      participations_submitting_idea = service.send(:participations_submitting_idea)

      idea_ids = participations_submitting_idea.map { |p| p[:item_id] }
      expect(idea_ids).not_to include(idea2.id)
    end
  end

  describe '#phase_participations' do
    it 'returns the expected aggregation of sets of participations' do
      participations = service.send(:phase_participations)

      expect(participations).to eq({
        submitting_idea: service.send(:participations_submitting_idea)
      })

      expect(participations[:submitting_idea].map { |p| p[:item_id] }).to contain_exactly(idea1.id, idea2.id, idea3.id, idea4.id, idea6.id, idea7.id)
    end
  end

  describe 'phase_participation_method_metrics' do
    it 'calculates the correct metrics' do
      participations = service.send(:phase_participations)
      metrics = service.send(:phase_participation_method_metrics, participations)

      expect(metrics).to eq({
        surveys_submitted: 6,
        surveys_submitted_7_day_percent_change: -33.3, # from 3 (in week before last) to 2 (in last 7 days) = -33.3% change
        completion_rate_as_percent: 85.7, # 6 submitted surveys out of 7 ideas created during phase
        completion_rate_7_day_percent_change: 33.3 # completion_rate_last_7_days: 1.0, completion_rate_previous_7_days: 0.75 = 33.3% change
      })
    end

    it 'handles zero ideas associated with the phase as expected' do
      Idea.destroy_all

      participations = { submitting_idea: [] }
      metrics = service.send(:phase_participation_method_metrics, participations)

      expect(metrics).to eq({
        surveys_submitted: 0,
        surveys_submitted_7_day_percent_change: 0,
        completion_rate_as_percent: 'submitted_count_compared_with_zero_ideas',
        completion_rate_7_day_percent_change: 'no_new_survey_responses_in_one_or_both_periods'
      })
    end
  end
end
