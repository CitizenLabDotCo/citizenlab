require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Phase insights' do
  before { admin_header_token }

  # Fixing the dates used as relative to this reference time means we can expect exact dates in the chart data
  let(:time_now) { Time.new(2025, 12, 2, 12, 0, 0) }

  let(:phase) { create(:poll_phase, start_at: time_now - 20.days, end_at: time_now - 3.days) }

  let!(:permission1) { create(:permission, action: 'taking_poll', permission_scope: phase) }

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

  let(:user1) { create(:user, custom_field_values: { gender: 'female', birthyear: 1980 }) }
  let!(:response1) { create(:poll_response, phase: phase, user: user1, created_at: time_now - 15.days) }

  let(:user2) { create(:user, custom_field_values: { gender: 'male', birthyear: 1990 }) }
  let!(:response2) { create(:poll_response, phase: phase, user: user2, created_at: time_now - 5.days) }

  let!(:session1) { create(:session, user_id: user1.id) }
  let!(:pageview1) { create(:pageview, session: session1, created_at: time_now - 15.days, project_id: phase.project.id) } # during phase

  let!(:session2) { create(:session, user_id: user2.id) }
  let!(:pageview2) { create(:pageview, session: session2, created_at: time_now - 15.days, project_id: phase.project.id) } # during phase
  let!(:pageview3) { create(:pageview, session: session2, created_at: time_now - 5.days, project_id: phase.project.id) } # during phase & last 7 days, same session

  let(:user3) { create(:user) }
  let!(:session3) { create(:session, user_id: user3.id) }
  let!(:pageview5) { create(:pageview, session: session3, created_at: time_now - 2.days, project_id: phase.project.id) } # after phase

  let(:id) { phase.id }

  get 'web_api/v1/phases/:id/insights' do
    example_request 'creates insights for volunteering phase' do
      assert_status 200

      expect(json_response_body[:data][:id]).to eq(phase.id.to_s)
      expect(json_response_body[:data][:type]).to eq('phase_insights')

      metrics = json_response_body.dig(:data, :attributes, :metrics)
      expect(metrics).to eq({
        visitors: 2,
        visitors_last_7_days: 1,
        participants: 2,
        participants_last_7_days: 1,
        engagement_rate: 1.0,
        poll: {
          responses: 2,
          responses_last_7_days: 1
        }
      })

      participants_and_visitors_chart_data = json_response_body.dig(:data, :attributes, :participants_and_visitors_chart_data)
      expect(participants_and_visitors_chart_data).to eq({
        resolution: 'day',
        timeseries: [
          { participants: 1, visitors: 2, date_group: '2025-11-17' },
          { participants: 1, visitors: 1, date_group: '2025-11-27' }
        ]
      })
    end

    include_examples 'phase insights demographics',
      gender_blank: 0,
      birthyear_blank: 0
  end
end
