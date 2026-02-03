require 'rails_helper'

RSpec.describe Insights::ProposalsPhaseInsightsService do
  let(:phase) { create(:proposals_phase, start_at: 17.days.ago, end_at: 2.days.ago) }
  let(:service) { described_class.new(phase) }

  let(:user1) { create(:user) }
  let!(:idea1) { create(:idea, phases: [phase], created_at: 20.days.ago, submitted_at: 20.days.ago, author: user1, creation_phase_id: phase.id) } # before phase start
  let!(:idea2) { create(:idea, phases: [phase], created_at: 10.days.ago, submitted_at: 10.days.ago, author: user1, creation_phase_id: phase.id) } # during phase
  let!(:idea3) { create(:idea, phases: [phase], created_at: 1.day.ago, submitted_at: 1.day.ago, author: user1, creation_phase_id: phase.id) } # after phase end

  let(:user2) { create(:user) }
  let!(:idea4) { create(:idea, phases: [phase], created_at: 10.days.ago, submitted_at: 10.days.ago, published_at: nil, publication_status: 'submitted', author: user2, creation_phase_id: phase.id) } # during phase, submitted but not published
  let!(:idea5) { create(:idea, phases: [phase], created_at: 10.days.ago, submitted_at: 10.days.ago, published_at: nil, author: user2, publication_status: 'draft', creation_phase_id: phase.id) } # during phase, but not submitted nor published

  let!(:idea6) { create(:idea, phases: [phase], created_at: 10.days.ago, submitted_at: 10.days.ago, author: nil, author_hash: 'some_author_hash', creation_phase_id: phase.id) } # during phase, no author (e.g. anonymous participation)
  let!(:idea7) { create(:idea, phases: [phase], created_at: 10.days.ago, submitted_at: 10.days.ago, author: nil, author_hash: nil, creation_phase_id: phase.id) } # during phase, no author nor author_hash (e.g. imported idea)

  let!(:comment1) { create(:comment, idea: idea1, created_at: 20.days.ago, author: user1) } # before phase start
  let!(:comment2) { create(:comment, idea: idea1, created_at: 10.days.ago, author: user1) } # during phase
  let!(:comment3) { create(:comment, idea: idea1, created_at: 1.day.ago, author: user1) } # after phase end

  let!(:comment4) { create(:comment, idea: idea1, created_at: 10.days.ago, author: user2) } # during phase

  let!(:comment5) { create(:comment, idea: idea1, created_at: 10.days.ago, author: nil, author_hash: 'some_author_hash') } # during phase, no author
  let!(:comment6) { create(:comment, idea: idea1, created_at: 10.days.ago, author: nil, author_hash: nil) } # during phase, no author nor author_hash

  let!(:reaction1) { create(:reaction, reactable: idea1, created_at: 20.days.ago, user: user1, mode: 'up') } # before phase start
  let!(:reaction2) { create(:reaction, reactable: idea2, created_at: 10.days.ago, user: user1, mode: 'up') } # during phase
  let!(:reaction3) { create(:reaction, reactable: idea3, created_at: 1.day.ago, user: user1, mode: 'up') } # after phase end

  let!(:reaction4) { create(:reaction, reactable: idea2, created_at: 10.days.ago, user: user2, mode: 'down') } # during phase

  let!(:reaction5) { create(:reaction, reactable: idea1, created_at: 10.days.ago, user: nil, mode: 'up') } # during phase, no user

  describe '#participations_posting_idea' do
    it 'returns the participation ideas published data for published ideas published during phase' do
      participations_posting_idea = service.send(:participations_posting_idea)

      expect(participations_posting_idea).to contain_exactly({
        item_id: idea2.id,
        action: 'posting_idea',
        acted_at: a_kind_of(Time),
        classname: 'Idea',
        threshold_reached_at: nil,
        participant_id: user1.id,
        custom_field_values: {}
      }, {
        item_id: idea4.id,
        action: 'posting_idea',
        acted_at: a_kind_of(Time),
        classname: 'Idea',
        threshold_reached_at: nil,
        participant_id: user2.id,
        custom_field_values: {}
      }, {
        item_id: idea6.id,
        action: 'posting_idea',
        acted_at: a_kind_of(Time),
        classname: 'Idea',
        threshold_reached_at: nil,
        participant_id: 'some_author_hash',
        custom_field_values: {}
      }, {
        item_id: idea7.id,
        action: 'posting_idea',
        acted_at: a_kind_of(Time),
        classname: 'Idea',
        threshold_reached_at: nil,
        participant_id: idea7.id,
        custom_field_values: {}
      })

      first_participation = participations_posting_idea.first
      expect(first_participation[:acted_at])
        .to be_within(1.second).of(Idea.find(first_participation[:item_id]).submitted_at)
    end

    it 'adds user custom field values as expected' do
      user1.update!(custom_field_values: { 'field_1' => 'value_1u', 'field_2' => 'value_2u' })

      prefix = UserFieldsInFormService.prefix
      idea2.update!(custom_field_values: { "#{prefix}field_1" => 'value_1i', 'field_3' => 'value_3i', "#{prefix}field_4" => 'value_4i' })

      participations_posting_idea = service.send(:participations_posting_idea)
      idea2_participation = participations_posting_idea.find { |p| p[:item_id] == idea2.id }

      # We expect that:
      # - field_1 value comes from idea2 (item), preferred over value from user1, which collides after removing key prefix
      # - field_2 comes from user1 custom_field_values (not present in idea2)
      # - field_3 filtered from idea2 (item) custom_field_values (no prefix)
      # - field_4 comes from idea2 (item) custom_field_values, with key prefix removed
      expect(idea2_participation[:custom_field_values])
        .to eq({ 'field_1' => 'value_1i', 'field_2' => 'value_2u', 'field_4' => 'value_4i' })
    end

    it 'correctly handles phases with no end date' do
      phase.update!(end_at: nil)
      participations_posting_idea = service.send(:participations_posting_idea)

      expect(participations_posting_idea.pluck(:item_id)).to contain_exactly(idea2.id, idea3.id, idea4.id, idea6.id, idea7.id)
    end

    it 'does not include ideas that are not submitted' do
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
        commenting_idea: service.send(:participations_commenting_idea),
        reacting_idea: service.send(:participations_reacting_idea)
      })

      expect(participations[:posting_idea].map { |p| p[:item_id] }).to contain_exactly(idea2.id, idea4.id, idea6.id, idea7.id)

      expect(participations[:commenting_idea].map { |p| p[:item_id] }).to contain_exactly(comment2.id, comment4.id, comment5.id, comment6.id)

      expect(participations[:reacting_idea].map { |p| p[:item_id] }).to contain_exactly(reaction2.id, reaction4.id, reaction5.id)
    end
  end

  describe '#threshold_reached_at' do
    it 'returns nil when idea has no threshold_reached status change' do
      threshold_reached_at = service.send(:threshold_reached_at, idea2)

      expect(threshold_reached_at).to be_nil
    end

    it 'returns the acted_at time when idea reached threshold' do
      activity_time = 8.days.ago
      create(
        :activity,
        item: idea2,
        action: 'changed_input_status',
        acted_at: activity_time,
        payload: {
          input_status_from_code: 'proposed',
          input_status_to_code: 'threshold_reached'
        }
      )

      threshold_reached_at = service.send(:threshold_reached_at, idea2)

      expect(threshold_reached_at).to be_within(1.second).of(activity_time)
    end

    it 'returns the threshold_reached time even when status changed again after' do
      threshold_time = 8.days.ago
      create(
        :activity,
        item: idea2,
        action: 'changed_input_status',
        acted_at: threshold_time,
        payload: {
          input_status_from_code: 'proposed',
          input_status_to_code: 'threshold_reached'
        }
      )

      create(
        :activity,
        item: idea2,
        action: 'changed_input_status',
        acted_at: 5.days.ago,
        payload: {
          input_status_from_code: 'threshold_reached',
          input_status_to_code: 'accepted'
        }
      )

      threshold_reached_at = service.send(:threshold_reached_at, idea2)

      expect(threshold_reached_at).to be_within(1.second).of(threshold_time)
    end

    it 'returns nil when idea has other status changes but not threshold_reached' do
      create(
        :activity,
        item: idea2,
        action: 'changed_input_status',
        acted_at: 8.days.ago,
        payload: {
          input_status_from_code: 'proposed',
          input_status_to_code: 'accepted'
        }
      )

      threshold_reached_at = service.send(:threshold_reached_at, idea2)

      expect(threshold_reached_at).to be_nil
    end
  end

  describe 'phase_participation_method_metrics' do
    let(:user1) { create(:user) }
    let(:participation1) { create(:posting_idea_participation, acted_at: 10.days.ago, user: user1) }
    let(:participation2) { create(:posting_idea_participation, acted_at: 5.days.ago, user: user1) }
    let(:participation3) { create(:commenting_idea_participation, acted_at: 10.days.ago, user: user1) }
    let(:participation4) { create(:commenting_idea_participation, acted_at: 5.days.ago, user: user1) }
    let(:participation5) { create(:reacting_idea_participation, acted_at: 10.days.ago, user: user1) }
    let(:participation6) { create(:reacting_idea_participation, acted_at: 5.days.ago, user: user1) }

    let(:participations) do
      {
        posting_idea: [participation1, participation2],
        commenting_idea: [participation3, participation4],
        reacting_idea: [participation5, participation6]
      }
    end

    it 'calculates the correct metrics' do
      participation1[:threshold_reached_at] = 8.days.ago
      metrics = service.send(:phase_participation_method_metrics, participations)

      expect(metrics).to eq({
        ideas_posted: 2,
        ideas_posted_7_day_percent_change: 0.0, # from 1 (in week before last) to 1 (in last 7 days) => 0% change
        reached_threshold: 1,
        reached_threshold_7_day_percent_change: -100.0, # from 1 (in week before last) to 0 (in last 7 days) => -100% change
        comments_posted: 2,
        comments_posted_7_day_percent_change: 0.0, # from 1 (in week before last) to 1 (in last 7 days) => 0% change
        reactions: 2,
        reactions_7_day_percent_change: 0.0 # from 1 (in week before last) to 1 (in last 7 days) => 0% change
      })
    end
  end
end
