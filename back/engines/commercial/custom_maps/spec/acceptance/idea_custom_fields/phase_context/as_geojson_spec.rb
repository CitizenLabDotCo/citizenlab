require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Idea Custom Fields' do
  explanation 'Fields in idea forms which are customized by the city, scoped on the project level.'

  before { header 'Content-Type', 'application/json' }

  get 'web_api/v1/admin/phases/:phase_id/custom_fields/:custom_field_id/as_geojson' do
    let(:project) { create(:single_phase_native_survey_project) }
    let(:phase) { project.phases.first }
    let(:phase_id) { phase.id }
    let(:form) { create(:custom_form, participation_context: phase) }
    let(:custom_field_point) do
      create(:custom_field_point, resource: form, key: 'point_key', title_multiloc: { 'en' => 'Point q title' })
    end
    let(:custom_field_id) { custom_field_point.id }
    let(:idea1) do
      create(
        :idea,
        creation_phase_id: phase_id,
        project: project,
        custom_field_values: {
          custom_field_point.key => {
            type: 'Point',
            coordinates: [
              4.34,
              50.86
            ]
          }
        }
      )
    end
    let!(:idea_phase1) { create(:ideas_phase, idea: idea1, phase: phase) }

    context 'when admin' do
      before { admin_header_token }

      example_request 'Generate GeoJSON for responses to a mapping question' do
        assert_status 200
        json_response = json_parse(response_body)

        expect(json_response).to eq({
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [4.34, 50.86] },
            properties: { 'Point q title [Longitude, Latitude]': { type: 'Point', coordinates: [4.34, 50.86] } }
          }]
        })
      end
    end
  end
end
