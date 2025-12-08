require 'rails_helper'

RSpec.describe Insights::VotingPhaseInsightsService do
  let(:service) { described_class.new(phase) }

  let!(:phase) { create(:multiple_voting_phase, start_at: 17.days.ago, end_at: 2.days.ago) }
  let!(:idea1) { create(:idea, phases: [phase]) }
  let!(:idea2) { create(:idea, phases: [phase]) }

  let(:user) { create(:user) }
  let!(:basket1) { create(:basket, phase: phase, user: user, submitted_at: phase.start_at + 1.day) }
  let!(:baskets_idea1) { create(:baskets_idea, basket: basket1, idea: idea1, votes: 2) }
  let!(:baskets_idea2) { create(:baskets_idea, basket: basket1, idea: idea2, votes: 3) }

  let!(:basket2) { create(:basket, phase: phase, user: nil, submitted_at: phase.start_at + 1.day) }
  let!(:baskets_idea3) { create(:baskets_idea, basket: basket2, idea: idea2, votes: 42) }

  let!(:comment1) { create(:comment, idea: idea1, created_at: 20.days.ago, author: user) } # before phase start
  let!(:comment2) { create(:comment, idea: idea1, created_at: 10.days.ago, author: user) } # during phase
  let!(:comment3) { create(:comment, idea: idea1, created_at: 1.day.ago, author: user) } # after phase end

  describe '#participations_voting' do
    it 'returns the participation baskets data associated with the phase' do
      participations_voting = service.send(:participations_voting)

      expect(participations_voting).to eq([
        {
          item_id: basket1.id,
          action: 'voting',
          acted_at: basket1.submitted_at,
          classname: 'Basket',
          participant_id: user.id,
          user_custom_field_values: {},
          votes: 5,
          ideas_count: 2
        },
        {
          item_id: basket2.id,
          action: 'voting',
          acted_at: basket2.submitted_at,
          classname: 'Basket',
          participant_id: basket2.id,
          user_custom_field_values: {},
          votes: 42,
          ideas_count: 1
        }
      ])

      first_participation = participations_voting.first
      expect(first_participation[:acted_at])
        .to be_within(1.second).of(Basket.find(first_participation[:item_id]).submitted_at)
    end
  end

  describe '#phase_participations' do
    it 'returns the expected aggregation of sets of participations' do
      participations = service.send(:phase_participations)

      expect(participations).to eq({
        voting: service.send(:participations_voting),
        commenting_idea: service.send(:participations_commenting_idea)
      })

      expect(participations[:voting].map { |p| p[:item_id] }).to contain_exactly(basket1.id, basket2.id)

      expect(participations[:commenting_idea].map { |p| p[:item_id] }).to contain_exactly(comment2.id)
    end
  end

  describe 'phase_participation_method_metrics' do
    let(:user1) { create(:user) }
    let(:participation1) { create(:basket_participation, :with_votes, vote_count: 2, acted_at: 10.days.ago, user: user1) }
    let(:participation2) { create(:basket_participation, :with_votes, vote_count: 3, acted_at: 5.days.ago, user: user1) }
    let(:participation3) { create(:commenting_idea_participation, acted_at: 10.days.ago, user: user1) }
    let(:participation4) { create(:commenting_idea_participation, acted_at: 5.days.ago, user: user1) }

    let(:participations) do
      {
        voting: [participation1, participation2],
        commenting_idea: [participation3, participation4]
      }
    end

    it 'calculates the correct metrics' do
      metrics = service.send(:phase_participation_method_metrics, participations)

      expect(metrics).to eq({
        voting_method: phase.voting_method,
        associated_ideas: 2,
        online_votes: 5,
        online_votes_7_day_change: 50.0, # from 2 (in week before last) to 3 (in last 7 days) = 50% increase
        offline_votes: phase.manual_votes_count,
        voters: 1,
        voters_7_day_change: 0.0, # from 1 (in week before last) to 1 (in last 7 days) = 0% change
        comments_posted: 2,
        comments_posted_7_day_change: 0.0 # from 1 (in week before last) to 1 (in last 7 days) = 0% change
      })
    end
  end
end
