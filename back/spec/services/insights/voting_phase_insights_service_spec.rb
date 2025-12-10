require 'rails_helper'

RSpec.describe Insights::VotingPhaseInsightsService do
  let(:service) { described_class.new(phase) }

  let!(:phase) { create(:multiple_voting_phase, start_at: 17.days.ago, end_at: 2.days.ago, manual_votes_count: 10) }
  let!(:idea1) { create(:idea, phases: [phase]) }
  let!(:idea2) { create(:idea, phases: [phase], manual_votes_amount: 10) }

  let(:user) { create(:user, custom_field_values: { gender: 'male' }) }
  let!(:basket1) { create(:basket, phase: phase, user: user, submitted_at: phase.start_at + 1.day) }
  let!(:baskets_idea1) { create(:baskets_idea, basket: basket1, idea: idea1, votes: 2) }
  let!(:baskets_idea2) { create(:baskets_idea, basket: basket1, idea: idea2, votes: 3) }

  let!(:basket2) { create(:basket, phase: phase, user: nil, submitted_at: phase.start_at + 1.day) }
  let!(:baskets_idea3) { create(:baskets_idea, basket: basket2, idea: idea2, votes: 42) }

  let!(:comment1) { create(:comment, idea: idea1, created_at: 20.days.ago, author: user) } # before phase start
  let!(:comment2) { create(:comment, idea: idea1, created_at: 10.days.ago, author: user) } # during phase
  let!(:comment3) { create(:comment, idea: idea1, created_at: 1.day.ago, author: user) } # after phase end

  # Update votes_count after creating baskets_ideas
  before do
    idea1.update_column(:votes_count, idea1.baskets_ideas.sum(:votes))
    idea2.update_column(:votes_count, idea2.baskets_ideas.sum(:votes))
  end

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
          user_custom_field_values: { 'gender' => 'male' },
          total_votes: 5,
          ideas_count: 2,
          votes_per_idea: {
            idea1.id => 2,
            idea2.id => 3
          }
        },
        {
          item_id: basket2.id,
          action: 'voting',
          acted_at: basket2.submitted_at,
          classname: 'Basket',
          participant_id: basket2.id,
          user_custom_field_values: {},
          total_votes: 42,
          ideas_count: 1,
          votes_per_idea: {
            idea2.id => 42
          }
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

  describe '#idea_ids_to_user_custom_field_values' do
    it 'returns a mapping of idea IDs to user custom field values from the participations' do
      participations = [
        create(:basket_participation, user: user, user_custom_field_values: { 'gender' => 'female' }, votes_per_idea: { idea1.id => 1, idea2.id => 1 }),
        create(:basket_participation, user: user, user_custom_field_values: { 'gender' => 'male' }, votes_per_idea: { idea2.id => 2 })
      ]

      mapping = service.send(:idea_ids_to_user_custom_field_values, participations)

      expect(mapping).to eq({
        idea1.id => [{ 'gender' => 'female' }],
        idea2.id => [{ 'gender' => 'female' }, { 'gender' => 'male' }, { 'gender' => 'male' }] # 2 * { 'gender' => 'male' } because 2 votes
      })
    end

    it 'handles empty participations' do
      mapping = service.send(:idea_ids_to_user_custom_field_values, [])
      expect(mapping).to eq({})
    end
  end

  describe '#idea_vote_counts_data' do
    let(:participations) { service.send(:phase_participations)[:voting] }
    let(:custom_field) { create(:custom_field, resource_type: 'User', key: 'gender', input_type: 'select', title_multiloc: { en: 'Gender' }) }

    it 'returns the correct vote counts data per idea for a given custom field' do
      participations[0][:user_custom_field_values] = { 'gender' => 'female' }
      participations[1][:user_custom_field_values] = { 'gender' => 'male' }

      data = service.send(:idea_vote_counts_data, [idea1, idea2], participations, custom_field)

      expect(data).to eq([
        {
          id: idea1.id,
          title_multiloc: idea1.title_multiloc,
          total_online_votes: 2,
          total_offline_votes: 0,
          total_votes: 2,
          demographic_breakdown: {
            'female' => 2,
            '_blank' => 0
          }
        },
        {
          id: idea2.id,
          title_multiloc: idea2.title_multiloc,
          total_online_votes: 45,
          total_offline_votes: 10,
          total_votes: 55,
          demographic_breakdown: {
            'female' => 3,
            'male' => 42,
            '_blank' => 10
          }
        }
      ])
    end

    it 'handles empty participations' do
      # Not necessary to set vote_counts to zero here, but doing so for clarity.
      idea1.update!(votes_count: 0)
      idea2.update!(votes_count: 0)

      data = service.send(:idea_vote_counts_data, [idea1, idea2], [], custom_field)
      expect(data).to eq([
        {
          id: idea1.id,
          title_multiloc: idea1.title_multiloc,
          total_online_votes: 0,
          total_offline_votes: 0,
          total_votes: 0,
          demographic_breakdown: { '_blank' => 0 }
        },
        {
          id: idea2.id,
          title_multiloc: idea2.title_multiloc,
          total_online_votes: 0,
          total_offline_votes: 10,
          total_votes: 10,
          demographic_breakdown: { '_blank' => 10 }
        }
      ])
    end

    it 'handles empty ideas and participations' do
      data = service.send(:idea_vote_counts_data, [], [], custom_field)
      expect(data).to eq([])
    end
  end

  describe '#vote_counts_with_user_custom_field_grouping' do
    it 'gives expected results when custom_field is nil' do
      result = service.vote_counts_with_user_custom_field_grouping(nil)

      expect(result).to eq(
        {
          online_votes: 47,
          offline_votes: 10,
          total_votes: 57,
          group_by: nil,
          custom_field_id: nil,
          options: [],
          ideas: [
            {
              id: idea1.id,
              title_multiloc: idea1.title_multiloc,
              total_online_votes: 2,
              total_offline_votes: 0,
              total_votes: 2,
              demographic_breakdown: nil
            },
            {
              id: idea2.id,
              title_multiloc: idea2.title_multiloc,
              total_online_votes: 45,
              total_offline_votes: 10,
              total_votes: 55,
              demographic_breakdown: nil
            }
          ]
        }
      )
    end

    it 'gives expected results when grouping by a custom field' do
      custom_field = create(:custom_field, resource_type: 'User', key: 'gender', input_type: 'select', title_multiloc: { en: 'Gender' })
      create(:custom_field_option, custom_field: custom_field, key: 'male', title_multiloc: { en: 'Male' })
      create(:custom_field_option, custom_field: custom_field, key: 'female', title_multiloc: { en: 'Female' })
      create(:custom_field_option, custom_field: custom_field, key: 'unspecified', title_multiloc: { en: 'Unspecified' })

      result = service.vote_counts_with_user_custom_field_grouping(custom_field.id)

      expect(result).to eq(
        {
          online_votes: 47,
          offline_votes: 10,
          total_votes: 57,
          group_by: 'gender',
          custom_field_id: custom_field.id,
          options: [
            { male: { id: custom_field.options.find_by(key: 'male').id, title_multiloc: { 'en' => 'Male' } }, ordering: 0 },
            { female: { id: custom_field.options.find_by(key: 'female').id, title_multiloc: { 'en' => 'Female' } }, ordering: 1 },
            { unspecified: { id: custom_field.options.find_by(key: 'unspecified').id, title_multiloc: { 'en' => 'Unspecified' } }, ordering: 2 }
          ],
          ideas: [
            {
              id: idea1.id,
              title_multiloc: idea1.title_multiloc,
              total_online_votes: 2,
              total_offline_votes: 0,
              total_votes: 2,
              demographic_breakdown: {
                'male' => 2,
                'female' => 0,
                'unspecified' => 0,
                '_blank' => 0
              }
            },
            {
              id: idea2.id,
              title_multiloc: idea2.title_multiloc,
              total_online_votes: 45,
              total_offline_votes: 10,
              total_votes: 55,
              demographic_breakdown: {
                'male' => 3,
                'female' => 0,
                'unspecified' => 0,
                '_blank' => 52
              }
            }
          ]
        }
      )
    end
  end
end
