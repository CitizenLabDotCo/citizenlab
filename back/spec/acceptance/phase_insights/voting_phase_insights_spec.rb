require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Phase insights' do
  before do
    admin_header_token
    # This reference time means we can expect exact dates in the chart data
    travel_to(Time.zone.parse('2025-12-02 12:00:00'))
  end

  let!(:custom_field_gender) { create(:custom_field, resource_type: 'User', key: 'gender', input_type: 'select', title_multiloc: { en: 'Gender' }) }
  let!(:custom_field_option_male) { create(:custom_field_option, custom_field: custom_field_gender, key: 'male', title_multiloc: { en: 'Male' }) }
  let!(:custom_field_option_female) { create(:custom_field_option, custom_field: custom_field_gender, key: 'female', title_multiloc: { en: 'Female' }) }
  let!(:custom_field_option_other) { create(:custom_field_option, custom_field: custom_field_gender, key: 'unspecified', title_multiloc: { en: 'Unspecified' }) }

  let!(:categorical_distribution) do
    create(
      :categorical_distribution,
      custom_field: custom_field_gender,
      population_counts: [480, 510, 10] # Male, Female, Unspecified counts
    )
  end

  let!(:custom_field_birthyear) { create(:custom_field, resource_type: 'User', key: 'birthyear', input_type: 'number', title_multiloc: { en: 'Birthyear' }) }

  let!(:binned_distribution) do
    create(
      :binned_distribution,
      custom_field: custom_field_birthyear,
      bins: [18, 25, 35, 45, 55, 65, nil], # Age ranges: <18, 18-25, 25-35, 35-45, 45-65, >65
      counts: [50, 200, 400, 300, 50, 700] # Population in each bin
    )
  end

  let(:ideation_phase) do
    create(
      :phase,
      participation_method: 'ideation',
      start_at: 30.days.ago,
      end_at: 16.days.ago
    )
  end

  let(:voting_phase) do
    create(
      :phase,
      participation_method: 'voting',
      voting_method: 'multiple_voting',
      start_at: 15.days.ago,
      end_at: 1.day.ago,
      project: ideation_phase.project,
      manual_votes_count: 3,
      with_permissions: true
    ).tap do |phase|
      # Ideas
      idea1 = create(:idea, phases: [ideation_phase, phase], project: ideation_phase.project, submitted_at: 20.days.ago)
      idea2 = create(:idea, phases: [ideation_phase, phase], project: ideation_phase.project, submitted_at: 20.days.ago)
      idea3 = create(:idea, phases: [ideation_phase, phase], project: ideation_phase.project, submitted_at: 20.days.ago)

      # Users
      user1 = create(:user)
      user2 = create(:user)
      user3 = create(:user)
      user4 = create(:user)
      user5 = create(:user, custom_field_values: { gender: 'female', birthyear: 1980 })
      user6 = create(:user, custom_field_values: { gender: 'male', birthyear: 1990 })

      # Comments
      create(:comment, idea: idea1, author: user1, created_at: 25.days.ago) # before voting phase (not counted)
      create(:comment, idea: idea2, author: user2, created_at: 13.days.ago) # during voting phase (in week before last)
      create(:comment, idea: idea3, author: user2, created_at: 5.days.ago) # during voting phase & last 7 days
      create(:comment, idea: idea3, author: user3, created_at: 5.days.ago) # during voting phase & last 7 days

      # Baskets and votes
      basket1 = create(:basket, phase: phase, user: user4, submitted_at: 20.days.ago) # before voting phase (still counts)
      create(:baskets_idea, basket: basket1, idea: idea1, votes: 1)
      create(:baskets_idea, basket: basket1, idea: idea2, votes: 3)

      basket2 = create(:basket, phase: phase, user: user5, submitted_at: 10.days.ago) # during voting phase (in week before last)
      create(:baskets_idea, basket: basket2, idea: idea2, votes: 1)

      basket3 = create(:basket, phase: phase, user: user6, submitted_at: 5.days.ago) # during voting phase & last 7 days
      create(:baskets_idea, basket: basket3, idea: idea3, votes: 1)

      # Pageviews and sessions
      session1 = create(:session, user_id: user2.id)
      create(:pageview, session: session1, created_at: 20.days.ago, project_id: phase.project.id) # before voting phase
      create(:pageview, session: session1, created_at: 13.days.ago, project_id: phase.project.id) # during voting phase (in week before last)

      session2 = create(:session, user_id: user2.id)
      create(:pageview, session: session2, created_at: 5.days.ago, project_id: phase.project.id) # during voting phase & last 7 days
      create(:pageview, session: session2, created_at: 4.days.ago, project_id: phase.project.id) # different session, but repeat visitor

      session3 = create(:session, user_id: user3.id)
      create(:pageview, session: session3, created_at: 10.days.ago, project_id: phase.project.id) # during voting phase (in week before last)
      session4 = create(:session, user_id: user4.id)
      create(:pageview, session: session4, created_at: 10.days.ago, project_id: phase.project.id) # during voting phase (in week before last)
      create(:pageview, session: session4, created_at: 5.days.ago, project_id: phase.project.id) # during voting phase & last 7 days

      session5 = create(:session, user_id: user5.id)
      create(:pageview, session: session5, created_at: 5.days.ago, project_id: phase.project.id) # during voting phase & last 7 days

      session6 = create(:session, user_id: user6.id)
      create(:pageview, session: session6, created_at: 5.days.ago, project_id: phase.project.id) # during voting phase & last 7 days

      session7 = create(:session, monthly_user_hash: 'fake_hash1')
      create(:pageview, session: session7, created_at: 10.days.ago, project_id: phase.project.id) # during voting phase (in week before last) (visitor did not participate)
      create(:pageview, session: session7, created_at: 5.days.ago, project_id: phase.project.id) # during voting phase & last 7 days (visitor did not participate)
    end
  end

  let(:id) { voting_phase.id }

  get 'web_api/v1/phases/:id/insights' do
    example_request 'returns insights data for a voting phase' do
      assert_status 200

      expect(json_response_body[:data][:id]).to eq(voting_phase.id.to_s)
      expect(json_response_body[:data][:type]).to eq('phase_insights')

      metrics = json_response_body.dig(:data, :attributes, :metrics)
      expect(metrics).to eq({
        visitors: 6,
        visitors_7_day_change: 25.0, # from 4 (in week before last) to 5 unique visitors (in last 7 days) = 25% increase
        participants: 5,
        participants_7_day_change: 50.0, # from 3 (in week before last) to 5 unique participants (in last 7 days) = 50% increase
        participation_rate: 0.833,
        participation_rate_7_day_change: 20.0, # participation_rate_last_7_days: 0.6, participation_rate_previous_7_days: 0.5 = (((0.6 - 0.5).to_f / 0.5) * 100.0).round(1)
        voting: {
          voting_method: 'multiple_voting',
          associated_ideas: 3,
          online_votes: 6,
          online_votes_7_day_change: 0.0, # from 3 (in week before last) to 3 (in last 7 days) = 0% change
          offline_votes: 3,
          voters: 3,
          voters_7_day_change: 0.0, # from 2 (in week before last) to 2 unique voters (in last 7 days) = 0% change
          comments_posted: 3,
          comments_posted_7_day_change: 100.0 # from 1 (in week before last) to 2 (in last 7 days) = 100% increase
        }
      })
    end

    include_examples 'phase insights demographics',
      gender_blank: 3,
      birthyear_blank: 3

    context 'when the voting method is budgeting' do
      before { voting_phase.update!(voting_method: 'budgeting') }

      example_request 'Get insights data for a budgeting voting phase' do
        assert_status 200

        expect(json_response_body[:data][:id]).to eq(voting_phase.id.to_s)
        expect(json_response_body[:data][:type]).to eq('phase_insights')

        metrics = json_response_body.dig(:data, :attributes, :metrics)
        expect(metrics).to eq({
          visitors: 6,
          visitors_7_day_change: 25.0, # from 4 (in week before last) to 5 unique visitors (in last 7 days) = 25% increase
          participants: 5,
          participants_7_day_change: 50.0, # from 3 (in week before last) to 5 unique participants (in last 7 days) = 50% increase
          participation_rate: 0.833,
          participation_rate_7_day_change: 20.0, # participation_rate_last_7_days: 0.6, participation_rate_previous_7_days: 0.5 = (((0.6 - 0.5).to_f / 0.5) * 100.0).round(1)
          voting: {
            voting_method: 'budgeting',
            associated_ideas: 3,
            online_picks: 4,
            online_picks_7_day_change: 0.0, # from 2 (in week before last) to 2 (in last 7 days) = 0% change
            offline_picks: 3,
            voters: 3,
            voters_7_day_change: 0.0, # from 2 (in week before last) to 2 unique voters (in last 7 days) = 0% change
            comments_posted: 3,
            comments_posted_7_day_change: 100.0 # from 1 (in week before last) to 2 (in last 7 days) = 100% increase
          }
        })

        participants_and_visitors_chart_data = json_response_body.dig(:data, :attributes, :participants_and_visitors_chart_data)
        expect(participants_and_visitors_chart_data).to eq({
          resolution: 'day',
          timeseries: [
            { participants: 1, visitors: 0, date_group: '2025-11-12' },
            { participants: 1, visitors: 1, date_group: '2025-11-19' },
            { participants: 1, visitors: 3, date_group: '2025-11-22' },
            { participants: 3, visitors: 5, date_group: '2025-11-27' },
            { participants: 0, visitors: 1, date_group: '2025-11-28' }
          ]
        })
      end

      include_examples 'phase insights demographics',
        gender_blank: 3,
        birthyear_blank: 3
    end
  end
end
