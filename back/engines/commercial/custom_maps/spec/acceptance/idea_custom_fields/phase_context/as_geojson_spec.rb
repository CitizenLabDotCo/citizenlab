require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Idea Custom Fields' do
  explanation 'Fields in idea forms which are customized by the city, scoped on the project level.'

  before { header 'Content-Type', 'application/json' }

  get 'web_api/v1/admin/phases/:phase_id/custom_fields/:custom_field_id/as_geojson' do
    let(:project) { create(:single_phase_native_survey_project) }
    let(:phase) { project.phases.first }
    let(:form) { create(:custom_form, participation_context: phase) }

    let(:custom_field_text) do
      create(:custom_field_text, resource: form, title_multiloc: { 'en' => 'Text q title' })
    end
    let(:custom_field_multiline_text) do
      create(
        :custom_field_multiline_text,
        resource: form,
        title_multiloc: { 'en' => 'Multiline q title' }
      )
    end

    let(:custom_field_select) do
      create(:custom_field_select, resource: form, title_multiloc: { 'en' => 'Select q title' })
    end
    let(:custom_field_option1) do
      create(:custom_field_option, custom_field: custom_field_select, title_multiloc: { 'en' => 'Option 1' })
    end

    let(:custom_field_multiselect) do
      create(:custom_field_multiselect, resource: form, title_multiloc: { 'en' => 'Multiselect q title' })
    end
    let(:custom_field_option2) do
      create(:custom_field_option, custom_field: custom_field_multiselect, title_multiloc: { 'en' => 'Option 2' })
    end
    let(:custom_field_option3) do
      create(:custom_field_option, custom_field: custom_field_multiselect, title_multiloc: { 'en' => 'Option 3' })
    end

    let(:custom_field_multiselect_image) do
      create(:custom_field_multiselect_image, resource: form, title_multiloc: { 'en' => 'Multiselect image q title' })
    end
    let(:custom_field_option4) do
      create(:custom_field_option, custom_field: custom_field_multiselect_image, title_multiloc: { 'en' => 'Option 4' })
    end
    let(:custom_field_option5) do
      create(:custom_field_option, custom_field: custom_field_multiselect_image, title_multiloc: { 'en' => 'Option 5' })
    end

    let(:custom_field_linear_scale) do
      create(:custom_field_linear_scale, resource: form, title_multiloc: { 'en' => 'Linear scale q title' })
    end

    let(:custom_field_number) do
      create(:custom_field_number, resource: form, title_multiloc: { 'en' => 'Number q title' })
    end

    let(:custom_field_file_upload) do
      create(:custom_field_file_upload, resource: form, title_multiloc: { 'en' => 'File upload q title' })
    end

    let(:custom_field_point) do
      create(:custom_field_point, resource: form, title_multiloc: { 'en' => 'Point q title' })
    end

    let(:custom_field_line) do
      create(:custom_field_line, resource: form, title_multiloc: { 'en' => 'Line q title' })
    end

    let(:custom_field_polygon) do
      create(:custom_field_polygon, resource: form, title_multiloc: { 'en' => 'Polygon q title' })
    end

    let(:idea1) do
      create(
        :idea,
        creation_phase: phase,
        project: project,
        custom_field_values: {
          custom_field_text.key => 'Text answer',
          custom_field_multiline_text.key => 'Multiline answer',
          custom_field_select.key => custom_field_option1.key,
          custom_field_multiselect.key => [custom_field_option2.key, custom_field_option3.key],
          custom_field_multiselect_image.key => [custom_field_option4.key, custom_field_option5.key],
          custom_field_linear_scale.key => 3,
          custom_field_number.key => 42,
          custom_field_point.key => { type: 'Point', coordinates: [1.1, 2.2] },
          custom_field_line.key => { type: 'LineString', coordinates: [[1.1, 2.2], [3.3, 4.4]] },
          custom_field_polygon.key => { type: 'Polygon', coordinates: [[[1, 2], [3, 4], [5, 6], [1, 2]]] }
        }
      )
    end
    let!(:file) { create(:idea_file, name: 'File1.pdf', idea: idea1) }
    let!(:idea_phase1) { create(:ideas_phase, idea: idea1, phase: phase) }

    let(:idea2) do
      create(
        :idea,
        creation_phase: phase,
        project: project,
        custom_field_values: { custom_field_point.key => { type: 'Point', coordinates: [3.3, 4.4] } }
      )
    end
    let!(:idea_phase2) { create(:ideas_phase, idea: idea2, phase: phase) }

    let(:phase_id) { phase.id }
    let(:custom_field_id) { custom_field_point.id } # The generated GeoJSON Features will be for responses to this q.

    before do
      cf_values = idea1.custom_field_values
      cf_values[custom_field_file_upload.key] = { 'id' => file.id, 'name' => file.name }
      idea1.update!(custom_field_values: cf_values)
    end

    context 'when admin' do
      before { admin_header_token }

      example_request 'Generate GeoJSON for responses to a mapping question' do
        assert_status 200
        json_response = json_parse(response_body)

        expect(json_response[:type]).to eq('FeatureCollection')

        expect(json_response[:features]).to match_array([
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [1.1, 2.2] },
            properties: {
              'Text q title': 'Text answer',
              'Multiline q title': 'Multiline answer',
              'Select q title': 'Option 1',
              'Multiselect q title': 'Option 2, Option 3',
              'Multiselect image q title': 'Option 4, Option 5',
              'Linear scale q title': 3,
              'Number q title': 42,
              'File upload q title': file.file.url,
              'Point q title [Longitude, Latitude]': { type: 'Point', coordinates: [1.1, 2.2] },
              'Line q title [Longitude, Latitude]': { type: 'LineString', coordinates: [[1.1, 2.2], [3.3, 4.4]] },
              'Polygon q title [Longitude, Latitude]': {
                type: 'Polygon',
                coordinates: [[[1, 2], [3, 4], [5, 6], [1, 2]]]
              }
            }
          },
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [3.3, 4.4] },
            properties: {
              'Text q title': '',
              'Multiline q title': '',
              'Select q title': '',
              'Multiselect q title': '',
              'Multiselect image q title': '',
              'Linear scale q title': '',
              'Number q title': '',
              'File upload q title': '',
              'Point q title [Longitude, Latitude]': { type: 'Point', coordinates: [3.3, 4.4] },
              'Line q title [Longitude, Latitude]': '',
              'Polygon q title [Longitude, Latitude]': ''
            }
          }
        ])
      end
    end
  end
end
