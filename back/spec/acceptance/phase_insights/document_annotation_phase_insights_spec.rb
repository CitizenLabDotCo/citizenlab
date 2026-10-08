require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Phase insights' do
  before do
    admin_header_token
    # This reference time means we can expect exact dates in the chart data
    AppConfiguration.instance.update!(platform_start_at: '2025-09-01')
    travel_to(Time.zone.parse('2025-12-02 12:00:00'))
  end

  let!(:custom_field_gender) { create(:custom_field, resource_type: 'User', key: 'gender', input_type: 'select', title_multiloc: { en: 'Gender' }) }
  let!(:custom_field_option_male) { create(:custom_field_option, custom_field: custom_field_gender, key: 'male', title_multiloc: { en: 'Male' }) }
  let!(:custom_field_option_female) { create(:custom_field_option, custom_field: custom_field_gender, key: 'female', title_multiloc: { en: 'Female' }) }
  let!(:custom_field_option_other) { create(:custom_field_option, custom_field: custom_field_gender, key: 'unspecified', title_multiloc: { en: 'Unspecified' }) }

  let!(:custom_field_birthyear) { create(:custom_field, resource_type: 'User', key: 'birthyear', input_type: 'number', title_multiloc: { en: 'Birthyear' }) }

  let!(:binned_distribution) do
    create(
      :binned_distribution,
      custom_field: custom_field_birthyear,
      bins: [18, 25, 35, 45, 55, 65, nil],
      counts: [50, 200, 400, 300, 50, 700]
    )
  end

  let(:document_annotation_phase) do
    create(:document_annotation_phase, start_at: 20.days.ago, end_at: 3.days.ago, with_permissions: true).tap do |phase|
      user1 = create(:user)
      user2 = create(:user)

      session1 = create(:session, user_id: user1.id)
      create(:pageview, session: session1, created_at: 12.days.ago, project_id: phase.project.id)

      session2 = create(:session, user_id: user2.id)
      create(:pageview, session: session2, created_at: 5.days.ago, project_id: phase.project.id)
    end
  end

  let(:id) { document_annotation_phase.id }

  get 'web_api/v1/phases/:id/insights' do
    example_request 'returns insights data for document annotation phase' do
      assert_status 200

      expect(json_response_body[:data][:id]).to eq(document_annotation_phase.id.to_s)
      expect(json_response_body[:data][:type]).to eq('phase_insights')

      metrics = json_response_body.dig(:data, :attributes, :metrics)
      expect(metrics).to eq({
        visitors: 2,
        visitors_7_day_percent_change: 100.0, # from 1 unique visitor 7-days ago to 2 now = 100% change
        participants: 0, # annotations are kept by Konveio, so none can be counted
        participants_7_day_percent_change: 0.0,
        participation_rate_as_percent: 0.0,
        participation_rate_7_day_percent_change: 0.0,
        document_annotation: {}
      })

      participants_and_visitors_chart_data = json_response_body.dig(:data, :attributes, :participants_and_visitors_chart_data)
      expect(participants_and_visitors_chart_data).to eq({
        resolution: 'day',
        timeseries: [
          { participants: 0, visitors: 1, date_group: '2025-11-20' },
          { participants: 0, visitors: 1, date_group: '2025-11-27' }
        ]
      })
    end

    example_request 'returns the demographic fields with empty series' do
      demographics = json_response_body.dig(:data, :attributes, :demographics)

      expect(demographics[:fields]).to contain_exactly({
        id: custom_field_gender.id,
        key: 'gender',
        code: nil,
        input_type: 'select',
        title_multiloc: { en: 'Gender' },
        series: { male: 0, female: 0, unspecified: 0, _blank: 0 },
        options: {
          male: { title_multiloc: { en: 'Male' }, ordering: 0 },
          female: { title_multiloc: { en: 'Female' }, ordering: 1 },
          unspecified: { title_multiloc: { en: 'Unspecified' }, ordering: 2 }
        },
        reference_distribution: nil
      }, {
        id: custom_field_birthyear.id,
        key: 'birthyear',
        code: nil,
        input_type: 'number',
        title_multiloc: { en: 'Birthyear' },
        series: { '18-24': 0, '25-34': 0, '35-44': 0, '45-54': 0, '55-64': 0, '65+': 0, _blank: 0 },
        reference_distribution: { '18-24': 50, '25-34': 200, '35-44': 400, '45-54': 300, '55-64': 50, '65+': 700 }
      })
    end
  end
end
