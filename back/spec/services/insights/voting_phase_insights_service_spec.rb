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

  let!(:basket3) { create(:basket, phase: phase, user: nil, submitted_at: nil) }
  let!(:baskets_idea4) { create(:baskets_idea, basket: basket3, idea: idea2, votes: 999) }

  let!(:comment1) { create(:comment, idea: idea1, created_at: 20.days.ago, author: user) } # before phase start
  let!(:comment2) { create(:comment, idea: idea1, created_at: 10.days.ago, author: user) } # during phase
  let!(:comment3) { create(:comment, idea: idea1, created_at: 1.day.ago, author: user) } # after phase end

  # Manually update votes_count for each idea to reflect only votes from submitted baskets, mimicking production behavior
  before do
    idea1.update_column(:votes_count, idea1.baskets_ideas.joins(:basket).where.not(baskets: { submitted_at: nil }).sum(:votes))
    idea2.update_column(:votes_count, idea2.baskets_ideas.joins(:basket).where.not(baskets: { submitted_at: nil }).sum(:votes))
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
        online_votes_7_day_percent_change: 50.0, # from 2 (in week before last) to 3 (in last 7 days) = 50% increase
        offline_votes: phase.manual_votes_count,
        voters: 1,
        voters_7_day_percent_change: 0.0, # from 1 (in week before last) to 1 (in last 7 days) = 0% change
        comments_posted: 2,
        comments_posted_7_day_percent_change: 0.0 # from 1 (in week before last) to 1 (in last 7 days) = 0% change
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
    let!(:custom_field_option_male) { create(:custom_field_option, custom_field: custom_field, key: 'male', title_multiloc: { en: 'Male' }) }
    let!(:custom_field_option_female) { create(:custom_field_option, custom_field: custom_field, key: 'female', title_multiloc: { en: 'Female' }) }
    let!(:custom_field_option_unspecified) { create(:custom_field_option, custom_field: custom_field, key: 'unspecified', title_multiloc: { en: 'Unspecified' }) }

    it 'returns the correct vote counts data per idea for a given custom field' do
      participations[0][:user_custom_field_values] = { 'gender' => 'female' }
      participations[1][:user_custom_field_values] = { 'gender' => 'male' }

      phase_total_votes = 57
      data = service.send(:idea_vote_counts_data, participations, custom_field, phase_total_votes)

      expect(data).to contain_exactly(
        {
          id: idea1.id,
          title_multiloc: idea1.title_multiloc,
          online_votes: 2,
          offline_votes: 0,
          total_votes: 2,
          percentage: 3.5,
          series: {
            'male' => { count: 0, percentage: 0.0 },
            'female' => { count: 2, percentage: 100.0 },
            'unspecified' => { count: 0, percentage: 0.0 },
            '_blank' => { count: 0, percentage: 0.0 }
          }
        },
        {
          id: idea2.id,
          title_multiloc: idea2.title_multiloc,
          online_votes: 45,
          offline_votes: 10,
          total_votes: 55,
          percentage: 96.5,
          series: {
            'male' => { count: 42, percentage: 76.4 },
            'female' => { count: 3, percentage: 5.5 },
            'unspecified' => { count: 0, percentage: 0.0 },
            '_blank' => { count: 10, percentage: 18.2 }
          }
        }
      )
    end

    it 'handles empty participations' do
      # Not necessary to set vote_counts to zero here, but doing so for clarity.
      idea1.update!(votes_count: 0)
      idea2.update!(votes_count: 0)

      phase_total_votes = 57
      data = service.send(:idea_vote_counts_data, [], custom_field, phase_total_votes)

      expect(data).to contain_exactly(
        {
          id: idea1.id,
          title_multiloc: idea1.title_multiloc,
          online_votes: 0,
          offline_votes: 0,
          total_votes: 0,
          percentage: 0.0,
          series: {
            'male' => { count: 0, percentage: nil },
            'female' => { count: 0, percentage: nil },
            'unspecified' => { count: 0, percentage: nil },
            '_blank' => { count: 0, percentage: nil }
          }
        },
        {
          id: idea2.id,
          title_multiloc: idea2.title_multiloc,
          online_votes: 0,
          offline_votes: 10,
          total_votes: 10,
          percentage: 17.5, # 10 / 57 total_phase_votes * 100
          series: {
            'male' => { count: 0, percentage: 0.0 },
            'female' => { count: 0, percentage: 0.0 },
            'unspecified' => { count: 0, percentage: 0.0 },
            '_blank' => { count: 10, percentage: 100.0 }
          }
        }
      )
    end

    it 'avoids division by zero when total_phase_votes is zero' do
      phase_total_votes = 0
      data = service.send(:idea_vote_counts_data, [], custom_field, phase_total_votes)
      expect(data.pluck(:percentage)).to all(be_nil)
    end
  end

  describe '#vote_counts_with_user_custom_field_grouping' do
    it 'gives expected results when custom_field is nil' do
      result = service.vote_counts_with_user_custom_field_grouping(nil)

      expect(result[:online_votes]).to eq(47)
      expect(result[:offline_votes]).to eq(10)
      expect(result[:total_votes]).to eq(57)
      expect(result[:group_by]).to be_nil
      expect(result[:custom_field_id]).to be_nil
      expect(result[:input_type]).to be_nil
      expect(result[:options]).to eq({})

      expect(result[:ideas]).to contain_exactly(
        {
          id: idea1.id,
          title_multiloc: idea1.title_multiloc,
          online_votes: 2,
          offline_votes: 0,
          total_votes: 2,
          percentage: 3.5, # 2 / 57 total_phase_votes * 100
          series: nil
        },
        {
          id: idea2.id,
          title_multiloc: idea2.title_multiloc,
          online_votes: 45,
          offline_votes: 10,
          total_votes: 55,
          percentage: 96.5, # 55 / 57 total_phase_votes * 100
          series: nil
        }
      )
    end

    it 'gives expected results when grouping by a single-select custom field' do
      custom_field = create(:custom_field, resource_type: 'User', key: 'gender', input_type: 'select', title_multiloc: { en: 'Gender' })
      create(:custom_field_option, custom_field: custom_field, key: 'male', title_multiloc: { en: 'Male' })
      create(:custom_field_option, custom_field: custom_field, key: 'female', title_multiloc: { en: 'Female' })
      create(:custom_field_option, custom_field: custom_field, key: 'unspecified', title_multiloc: { en: 'Unspecified' })

      result = service.vote_counts_with_user_custom_field_grouping(custom_field)

      expect(result[:online_votes]).to eq(47)
      expect(result[:offline_votes]).to eq(10)
      expect(result[:total_votes]).to eq(57)
      expect(result[:group_by]).to eq('gender')
      expect(result[:custom_field_id]).to eq(custom_field.id)
      expect(result[:input_type]).to eq('select')
      expect(result[:options]).to eq({
        'male' => { title_multiloc: { 'en' => 'Male' }, ordering: 0 },
        'female' => { title_multiloc: { 'en' => 'Female' }, ordering: 1 },
        'unspecified' => { title_multiloc: { 'en' => 'Unspecified' }, ordering: 2 }
      })

      expect(result[:ideas]).to contain_exactly(
        {
          id: idea1.id,
          title_multiloc: idea1.title_multiloc,
          online_votes: 2,
          offline_votes: 0,
          total_votes: 2,
          percentage: 3.5, # 2 / 57 total_phase_votes * 100
          series: {
            'male' => { count: 2, percentage: 100.0 },
            'female' => { count: 0, percentage: 0.0 },
            'unspecified' => { count: 0, percentage: 0.0 },
            '_blank' => { count: 0, percentage: 0.0 }
          }
        },
        {
          id: idea2.id,
          title_multiloc: idea2.title_multiloc,
          online_votes: 45,
          offline_votes: 10,
          total_votes: 55,
          percentage: 96.5, # 55 / 57 total_phase_votes * 100
          series: {
            'male' => { count: 3, percentage: 5.5 },
            'female' => { count: 0, percentage: 0.0 },
            'unspecified' => { count: 0, percentage: 0.0 },
            '_blank' => { count: 52, percentage: 94.5 }
          }
        }
      )
    end

    it 'gives expected results when grouping by a multi-select custom field' do
      custom_field = create(:custom_field, resource_type: 'User', key: 'multiselect', input_type: 'multiselect', title_multiloc: { en: 'Multi-select' })
      create(:custom_field_option, custom_field: custom_field, key: 'option_a', title_multiloc: { en: 'Option A' })
      create(:custom_field_option, custom_field: custom_field, key: 'option_b', title_multiloc: { en: 'Option B' })

      user.update!(custom_field_values: { 'multiselect' => %w[option_a option_b] })

      result = service.vote_counts_with_user_custom_field_grouping(custom_field)

      expect(result[:online_votes]).to eq(47)
      expect(result[:offline_votes]).to eq(10)
      expect(result[:total_votes]).to eq(57)
      expect(result[:group_by]).to eq('multiselect')
      expect(result[:custom_field_id]).to eq(custom_field.id)
      expect(result[:input_type]).to eq('multiselect')
      expect(result[:options]).to eq({
        'option_a' => { title_multiloc: { 'en' => 'Option A' }, ordering: 0 },
        'option_b' => { title_multiloc: { 'en' => 'Option B' }, ordering: 1 }
      })

      expect(result[:ideas]).to contain_exactly(
        {
          id: idea1.id,
          title_multiloc: idea1.title_multiloc,
          online_votes: 2,
          offline_votes: 0,
          total_votes: 2,
          percentage: 3.5, # 2 / 57 total_phase_votes * 100
          series: {
            'option_a' => { count: 2, percentage: 100.0 },
            'option_b' => { count: 2, percentage: 100.0 },
            '_blank' => { count: 0, percentage: 0.0 }
          }
        },
        {
          id: idea2.id,
          title_multiloc: idea2.title_multiloc,
          online_votes: 45,
          offline_votes: 10,
          total_votes: 55,
          percentage: 96.5, # 55 / 57 total_phase_votes * 100
          series: {
            'option_a' => { count: 3, percentage: 5.5 },
            'option_b' => { count: 3, percentage: 5.5 },
            '_blank' => { count: 52, percentage: 94.5 }
          }
        }
      )
    end

    it 'gives expected results when grouping by a checkbox custom field' do
      custom_field = create(:custom_field, resource_type: 'User', key: 'checkbox', input_type: 'checkbox', title_multiloc: { en: 'Checkbox' })
      user.update!(custom_field_values: { 'checkbox' => true })

      result = service.vote_counts_with_user_custom_field_grouping(custom_field)

      expect(result[:online_votes]).to eq(47)
      expect(result[:offline_votes]).to eq(10)
      expect(result[:total_votes]).to eq(57)
      expect(result[:group_by]).to eq('checkbox')
      expect(result[:custom_field_id]).to eq(custom_field.id)
      expect(result[:input_type]).to eq('checkbox')
      expect(result[:options]).to eq({})

      expect(result[:ideas]).to contain_exactly(
        {
          id: idea1.id,
          title_multiloc: idea1.title_multiloc,
          online_votes: 2,
          offline_votes: 0,
          total_votes: 2,
          percentage: 3.5, # 2 / 57 total_phase_votes * 100
          series: {
            true => { count: 2, percentage: 100.0 },
            false => { count: 0, percentage: 0.0 },
            '_blank' => { count: 0, percentage: 0.0 }
          }
        },
        {
          id: idea2.id,
          title_multiloc: idea2.title_multiloc,
          online_votes: 45,
          offline_votes: 10,
          total_votes: 55,
          percentage: 96.5, # 55 / 57 total_phase_votes * 100
          series: {
            true => { count: 3, percentage: 5.5 },
            false => { count: 0, percentage: 0.0 },
            '_blank' => { count: 52, percentage: 94.5 }
          }
        }
      )
    end

    it 'gives expected results when grouping by a birthyear custom field' do
      # Ensure consistent date as stats will be different in first six months of year vs last six months
      travel_to(Date.parse('2025-10-01')) do
        custom_field = create(:custom_field, resource_type: 'User', key: 'birthyear', input_type: 'number', title_multiloc: { en: 'Birthyear' })

        create(
          :binned_distribution,
          custom_field: custom_field,
          bins: [18, 25, 35, 45, 55, 65, nil], # Age ranges: <18, 18-25, 25-35, 35-45, 45-65, >65
          counts: [50, 200, 400, 300, 50, 700] # Population in each bin
        )

        user.update!(custom_field_values: { 'birthyear' => Date.current.year - 30 }) # Age 30

        result = service.vote_counts_with_user_custom_field_grouping(custom_field)

        expect(result[:online_votes]).to eq(47)
        expect(result[:offline_votes]).to eq(10)
        expect(result[:total_votes]).to eq(57)
        expect(result[:group_by]).to eq('birthyear')
        expect(result[:custom_field_id]).to eq(custom_field.id)
        expect(result[:input_type]).to eq('number')
        expect(result[:options]).to eq({})

        expect(result[:ideas]).to contain_exactly(
          {
            id: idea1.id,
            title_multiloc: idea1.title_multiloc,
            online_votes: 2,
            offline_votes: 0,
            total_votes: 2,
            percentage: 3.5, # 2 / 57 total_phase_votes * 100
            series: {
              '18-24' => { count: 0, percentage: 0.0 },
              '25-34' => { count: 2, percentage: 100.0 },
              '35-44' => { count: 0, percentage: 0.0 },
              '45-54' => { count: 0, percentage: 0.0 },
              '55-64' => { count: 0, percentage: 0.0 },
              '65+' => { count: 0, percentage: 0.0 },
              '_blank' => { count: 0, percentage: 0.0 }
            }
          },
          {
            id: idea2.id,
            title_multiloc: idea2.title_multiloc,
            online_votes: 45,
            offline_votes: 10,
            total_votes: 55,
            percentage: 96.5, # 55 / 57 total_phase_votes * 100
            series: {
              '18-24' => { count: 0, percentage: 0.0 },
              '25-34' => { count: 3, percentage: 5.5 },
              '35-44' => { count: 0, percentage: 0.0 },
              '45-54' => { count: 0, percentage: 0.0 },
              '55-64' => { count: 0, percentage: 0.0 },
              '65+' => { count: 0, percentage: 0.0 },
              '_blank' => { count: 52, percentage: 94.5 }
            }
          }
        )
      end
    end
  end

  describe '#ideas_ordered_by_total_votes' do
    it 'returns ideas ordered by total votes' do
      idea1.update!(votes_count: 2, manual_votes_amount: 0)   # total votes = 2
      idea2.update!(votes_count: 45, manual_votes_amount: 10) # total votes = 55
      idea3 = create(:idea, phases: [phase], votes_count: 0, manual_votes_amount: 0) # total votes = 0
      idea4 = create(:idea, phases: [phase], votes_count: 10, manual_votes_amount: 5) # total votes = 15

      ordered_ideas = service.send(:ideas_ordered_by_total_votes)

      expect(ordered_ideas).to eq([idea2, idea4, idea1, idea3])
    end

    it 'orders ideas by total votes for budgeting voting method' do
      phase.update!(voting_method: 'budgeting')

      idea1.update!(baskets_count: 3, manual_votes_amount: 0)   # total votes = 3
      idea2.update!(baskets_count: 20, manual_votes_amount: 10) # total votes = 30
      idea3 = create(:idea, phases: [phase], baskets_count: 0, manual_votes_amount: 0) # total votes = 0
      idea4 = create(:idea, phases: [phase], baskets_count: 7, manual_votes_amount: 0) # total votes = 7

      ordered_ideas = service.send(:ideas_ordered_by_total_votes)

      expect(ordered_ideas).to eq([idea2, idea4, idea1, idea3])
    end
  end
end
