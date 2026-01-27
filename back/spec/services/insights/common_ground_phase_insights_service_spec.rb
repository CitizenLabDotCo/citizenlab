require 'rails_helper'

RSpec.describe Insights::CommonGroundPhaseInsightsService do
  let(:service) { described_class.new(phase) }
  let(:phase) { create(:common_ground_phase, start_at: 17.days.ago, end_at: 2.days.ago) }

  let(:user1) { create(:user) }
  let!(:idea1) { create(:idea, phases: [phase], created_at: 20.days.ago, published_at: 20.days.ago, author: user1, creation_phase_id: phase.id) } # before phase start
  let!(:idea2) { create(:idea, phases: [phase], created_at: 10.days.ago, published_at: 10.days.ago, author: user1, creation_phase_id: phase.id) } # during phase
  let!(:idea3) { create(:idea, phases: [phase], created_at: 1.day.ago, published_at: 1.day.ago, author: user1, creation_phase_id: phase.id) } # after phase end

  let(:user2) { create(:user) }
  let!(:idea4) { create(:idea, phases: [phase], created_at: 10.days.ago, published_at: 10.days.ago, author: user2, creation_phase_id: phase.id) } # during phase
  let!(:idea5) { create(:idea, phases: [phase], created_at: 10.days.ago, published_at: nil, author: user2, publication_status: 'draft', creation_phase_id: phase.id) } # during phase, but not published

  let!(:idea6) { create(:idea, phases: [phase], created_at: 10.days.ago, published_at: 10.days.ago, author: nil, author_hash: 'some_author_hash', creation_phase_id: phase.id) } # during phase, no author (e.g. anonymous participation)
  let!(:idea7) { create(:idea, phases: [phase], created_at: 10.days.ago, published_at: 10.days.ago, author: nil, author_hash: nil, creation_phase_id: phase.id) } # during phase, no author nor author_hash (e.g. imported idea)

  let!(:reaction1) { create(:reaction, reactable: idea1, user: user1, created_at: 5.days.ago) } # during phase, and in last 7 days
  let!(:reaction2) { create(:reaction, reactable: idea1, user: user2, created_at: 1.day.ago) } # not during phase

  describe '#participations_posting_idea' do
    it 'returns the participation ideas published data for published ideas published during phase' do
      participations_posting_idea = service.send(:participations_posting_idea)

      expect(participations_posting_idea).to contain_exactly({
        item_id: idea2.id,
        action: 'posting_idea',
        acted_at: a_kind_of(Time),
        classname: 'Idea',
        participant_id: user1.id,
        user_custom_field_values: {}
      }, {
        item_id: idea4.id,
        action: 'posting_idea',
        acted_at: a_kind_of(Time),
        classname: 'Idea',
        participant_id: user2.id,
        user_custom_field_values: {}
      }, {
        item_id: idea6.id,
        action: 'posting_idea',
        acted_at: a_kind_of(Time),
        classname: 'Idea',
        participant_id: 'some_author_hash',
        user_custom_field_values: {}
      }, {
        item_id: idea7.id,
        action: 'posting_idea',
        acted_at: a_kind_of(Time),
        classname: 'Idea',
        participant_id: idea7.id,
        user_custom_field_values: {}
      })

      first_participation = participations_posting_idea.first
      expect(first_participation[:acted_at])
        .to be_within(1.second).of(Idea.find(first_participation[:item_id]).published_at)
    end

    it 'correctly handles phases with no end date' do
      phase.update!(end_at: nil)
      participations_posting_idea = service.send(:participations_posting_idea)

      expect(participations_posting_idea.pluck(:item_id)).to contain_exactly(idea2.id, idea3.id, idea4.id, idea6.id, idea7.id)
    end

    it 'does not include ideas that are not published' do
      participations_posting_idea = service.send(:participations_posting_idea)

      idea_ids = participations_posting_idea.map { |p| p[:item_id] }
      expect(idea_ids).not_to include(idea5.id)
    end

    it 'does not include transitive ideas' do
      idea2.creation_phase_id = nil
      idea2.save!(validate: false) # skip validations to allow non-transitive idea
      participations_posting_idea = service.send(:participations_posting_idea)

      idea_ids = participations_posting_idea.map { |p| p[:item_id] }
      expect(idea_ids).not_to include(idea2.id)
    end
  end

  describe '#phase_participations' do
    it 'returns the expected aggregation of sets of participations' do
      participations = service.send(:phase_participations)

      expect(participations).to eq({
        posting_idea: service.send(:participations_posting_idea),
        reacting_idea: service.send(:participations_reacting_idea)
      })

      expect(participations[:posting_idea].map { |p| p[:item_id] }).to contain_exactly(idea2.id, idea4.id, idea6.id, idea7.id)

      expect(participations[:reacting_idea].map { |p| p[:item_id] }).to contain_exactly(reaction1.id)
    end
  end

  describe 'phase_participation_method_metrics' do
    let(:user1) { create(:user) }
    let(:participation1) { create(:posting_idea_participation, acted_at: 10.days.ago, user: user1) }
    let(:participation2) { create(:posting_idea_participation, acted_at: 5.days.ago, user: user1) }
    let(:participation3) { create(:reacting_idea_participation, acted_at: 10.days.ago, user: user1) }
    let(:participation4) { create(:reacting_idea_participation, acted_at: 5.days.ago, user: user1) }

    let(:participations) do
      {
        posting_idea: [participation1, participation2],
        reacting_idea: [participation3, participation4]
      }
    end

    it 'calculates the correct metrics' do
      metrics = service.send(:phase_participation_method_metrics, participations)

      expect(metrics).to eq({
        associated_ideas: 6,
        ideas_posted: 2,
        ideas_posted_7_day_percent_change: 0.0, # from 1 (in week before last) to 1 (in last 7 days) = 0% change
        reactions: 2,
        reactions_7_day_percent_change: 0.0 # from 1 (in week before last) to 1 (in last 7 days) = 0% change
      })
    end
  end
end
