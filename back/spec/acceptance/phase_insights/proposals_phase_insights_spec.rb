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

  let(:proposals_phase) do
    create(
      :phase,
      participation_method: 'proposals',
      start_at: 20.days.ago,
      end_at: 3.days.ago,
      with_permissions: true
    ).tap do |phase|
      # Users
      user1 = create(:user)
      user2 = create(:user)
      user3 = create(:user)
      user4 = create(:user, custom_field_values: { gender: 'female', birthyear: 1980 })
      user5 = create(:user, custom_field_values: { gender: 'male', birthyear: 1990 })

      # Ideas
      idea1 = create(:idea, phases: [phase], author: user1, created_at: 25.days.ago, submitted_at: 25.days.ago, creation_phase_id: phase.id) # published before phase (not counted)
      idea2 = create(:idea, phases: [phase], author: user2, created_at: 13.days.ago, submitted_at: 13.days.ago, creation_phase_id: phase.id) # published during phase (in week before last)
      idea3 = create(:idea, phases: [phase], author: user2, created_at: 5.days.ago, submitted_at: 5.days.ago, creation_phase_id: phase.id) # published during phase, and in last 7 days
      create(:idea, phases: [phase], author: user3, created_at: 2.days.ago, submitted_at: 2.days.ago, creation_phase_id: phase.id) # published after phase (not counted)

      # Activities
      create(
        :activity,
        item: idea2,
        action: 'changed_input_status',
        acted_at: 10.days.ago,
        payload: {
          input_status_from_code: 'proposed',
          input_status_to_code: 'threshold_reached'
        }
      )

      create(
        :activity,
        item: idea3,
        action: 'changed_input_status',
        acted_at: 3.days.ago,
        payload: {
          input_status_from_code: 'proposed',
          input_status_to_code: 'threshold_reached'
        }
      )

      # Comments
      create(:comment, idea: idea2, author: user4, created_at: 10.days.ago) # during phase (in week before last)

      # Reactions
      create(:reaction, reactable: idea1, user: user5, created_at: 5.days.ago) # during phase & last 7 days

      # Pageviews and sessions
      session1 = create(:session, user_id: user1.id)
      create(:pageview, session: session1, created_at: 25.days.ago, project_id: phase.project.id) # before phase

      session2 = create(:session, user_id: user2.id)
      create(:pageview, session: session2, created_at: 13.days.ago, project_id: phase.project.id) # during phase (in week before last)
      create(:pageview, session: session2, created_at: 5.days.ago, project_id: phase.project.id) # during phase & last 7 days, same session

      session3 = create(:session, user_id: user3.id)
      create(:pageview, session: session3, created_at: 2.days.ago, project_id: phase.project.id) # after phase

      session4 = create(:session)
      create(:pageview, session: session4, created_at: 15.days.ago, project_id: phase.project.id) # during phase, did not participate

      session5 = create(:session, user_id: user4.id)
      create(:pageview, session: session5, created_at: 10.days.ago, project_id: phase.project.id) # during phase (in week before last)

      session6 = create(:session, user_id: user5.id)
      create(:pageview, session: session6, created_at: 5.days.ago, project_id: phase.project.id) # during phase & last 7 days
    end
  end

  let(:id) { proposals_phase.id }

  get 'web_api/v1/phases/:id/insights' do
    example_request 'returns insights data for proposals phase' do
      assert_status 200

      expect(json_response_body[:data][:id]).to eq(proposals_phase.id.to_s)
      expect(json_response_body[:data][:type]).to eq('phase_insights')

      metrics = json_response_body.dig(:data, :attributes, :metrics)
      expect(metrics).to eq({
        visitors: 4,
        visitors_7_day_percent_change: 0.0, # from 2 (in week before last) to 2 unique visitors (in last 7 days) = 0% change
        participants: 3,
        participants_7_day_percent_change: 0.0, # from 2 (in week before last) to 2 unique participants (in last 7 days) = 0% change
        participation_rate_as_percent: 75.0,
        participation_rate_7_day_percent_change: 0.0, # participation_rate_last_7_days: 1.0, participation_rate_previous_7_days: 1.0 = 0% change
        proposals: {
          ideas_posted: 2,
          ideas_posted_7_day_percent_change: 0.0, # from 1 (in week before last) to 1 (in last 7 days) => 0% change
          reached_threshold: 2,
          reached_threshold_7_day_percent_change: 0.0, # from 1 (in week before last) to 1 (in last 7 days) => 0% change
          comments_posted: 1,
          comments_posted_7_day_percent_change: -100.0, # from 1 (in week before last) to 0 (in last 7 days) = -100% decrease
          reactions: 1,
          reactions_7_day_percent_change: 'last_7_days_compared_with_zero' # from 0 (in week before last) to 1 (in last 7 days) => avoid division by zero
        }
      })

      participants_and_visitors_chart_data = json_response_body.dig(:data, :attributes, :participants_and_visitors_chart_data)
      expect(participants_and_visitors_chart_data).to eq({
        resolution: 'day',
        timeseries: [
          { participants: 0, visitors: 1, date_group: '2025-11-17' },
          { participants: 1, visitors: 1, date_group: '2025-11-19' },
          { participants: 1, visitors: 1, date_group: '2025-11-22' },
          { participants: 2, visitors: 2, date_group: '2025-11-27' }
        ]
      })
    end

    include_examples 'phase insights demographics',
      gender_blank: 1,
      birthyear_blank: 1
  end
end
