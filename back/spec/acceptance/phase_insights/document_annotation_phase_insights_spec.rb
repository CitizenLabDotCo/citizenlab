require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Phase insights' do
  before do
    admin_header_token
    # This reference time means we can expect exact dates in the chart data
    AppConfiguration.instance.update!(platform_start_at: '2025-09-01')
    travel_to(Time.zone.parse('2025-12-02 12:00:00'))
  end

  # Registered so the empty demographics below are the phase's own doing, not an
  # absence of fields to report on.
  let!(:custom_field_gender) { create(:custom_field, resource_type: 'User', key: 'gender', input_type: 'select', title_multiloc: { en: 'Gender' }) }
  let!(:custom_field_birthyear) { create(:custom_field, resource_type: 'User', key: 'birthyear', input_type: 'number', title_multiloc: { en: 'Birthyear' }) }

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
        participants: nil, # annotations are kept by Konveio, so participants are unknown rather than zero
        participants_7_day_percent_change: nil,
        participation_rate_as_percent: nil,
        participation_rate_7_day_percent_change: nil,
        document_annotation: {}
      })

      participants_and_visitors_chart_data = json_response_body.dig(:data, :attributes, :participants_and_visitors_chart_data)
      expect(participants_and_visitors_chart_data).to eq({
        resolution: 'day',
        # The participant series stays at 0 rather than reporting unknowns: the
        # metrics above are what tells a consumer to leave the line unplotted.
        timeseries: [
          { participants: 0, visitors: 1, date_group: '2025-11-20' },
          { participants: 0, visitors: 1, date_group: '2025-11-27' }
        ]
      })
    end

    example_request 'returns no demographic fields, as the audience behind the visits is unknown' do
      demographics = json_response_body.dig(:data, :attributes, :demographics)

      expect(demographics[:fields]).to eq([])
    end
  end
end
