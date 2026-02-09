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

  let(:poll_phase) do
    create(:poll_phase, start_at: 20.days.ago, end_at: 3.days.ago, with_permissions: true).tap do |phase|
      # Users
      user1 = create(:user, custom_field_values: { gender: 'female', birthyear: 1980 })
      user2 = create(:user, custom_field_values: { gender: 'male', birthyear: 1990 })
      user3 = create(:user)

      # Poll responses
      create(:poll_response, phase: phase, user: user1, created_at: 12.days.ago) # during phase (in week before last)
      create(:poll_response, phase: phase, user: user2, created_at: 5.days.ago) # during phase & last 7 days

      # Pageviews and sessions
      session1 = create(:session, user_id: user1.id)
      create(:pageview, session: session1, created_at: 12.days.ago, project_id: phase.project.id) # during phase (in week before last)

      session2 = create(:session, user_id: user2.id)
      create(:pageview, session: session2, created_at: 12.days.ago, project_id: phase.project.id) # during phase (in week before last)
      create(:pageview, session: session2, created_at: 5.days.ago, project_id: phase.project.id) # during phase & last 7 days, same session

      session3 = create(:session, user_id: user3.id)
      create(:pageview, session: session3, created_at: 2.days.ago, project_id: phase.project.id) # after phase
    end
  end

  let(:id) { poll_phase.id }

  get 'web_api/v1/phases/:id/insights' do
    example_request 'returns insights data for poll phase' do
      assert_status 200

      expect(json_response_body[:data][:id]).to eq(poll_phase.id.to_s)
      expect(json_response_body[:data][:type]).to eq('phase_insights')

      metrics = json_response_body.dig(:data, :attributes, :metrics)
      expect(metrics).to eq({
        visitors: 2,
        visitors_7_day_percent_change: -50.0, # from 2 (in week before last) to 1 unique visitor (in last 7 days) = -50% decrease
        participants: 2,
        participants_7_day_percent_change: 0.0, # from 1 (in week before last) to 1 unique participant (in last 7 days) = 0% change
        participation_rate_as_percent: 100.0,
        participation_rate_7_day_percent_change: 100.0, # participation_rate_last_7_days: 1.0, participation_rate_previous_7_days: 0.5 = (((1.0 - 0.5).to_f / 0.5) * 100.0).round(1)
        poll: {
          responses: 2,
          responses_7_day_percent_change: 0.0 # from 1 (in week before last) to 1 (in last 7 days) = 0% change
        }
      })

      participants_and_visitors_chart_data = json_response_body.dig(:data, :attributes, :participants_and_visitors_chart_data)
      expect(participants_and_visitors_chart_data).to eq({
        resolution: 'day',
        timeseries: [
          { participants: 1, visitors: 2, date_group: '2025-11-20' },
          { participants: 1, visitors: 1, date_group: '2025-11-27' }
        ]
      })
    end

    include_examples 'phase insights demographics',
      gender_blank: 0,
      birthyear_blank: 0
  end
end
