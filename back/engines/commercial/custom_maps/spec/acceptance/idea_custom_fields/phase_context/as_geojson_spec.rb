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
      create(
        :custom_field_text,
        resource: form,
        title_multiloc: { 'en' => 'What is your job title?', 'nl-NL' => 'Wat is uw functie?' }
      )
    end
    let(:custom_field_multiline_text) do
      create(
        :custom_field_multiline_text,
        resource: form,
        title_multiloc: {
          'en' => 'What are your main responsibilities?',
          'nl-NL' => 'Wat zijn uw belangrijkste verantwoordelijkheden?'
        }
      )
    end

    let(:custom_field_select) do
      create(
        :custom_field_select,
        resource: form,
        title_multiloc: { 'en' => 'Select your favourite color', 'nl-NL' => 'Selecteer uw favoriete kleur' }
      )
    end
    let(:custom_field_option1) do
      create(
        :custom_field_option,
        custom_field: custom_field_select,
        title_multiloc: { 'en' => 'Option 1', 'nl-NL' => 'Optie 1' }
      )
    end

    let(:custom_field_multiselect) do
      create(
        :custom_field_multiselect,
        resource: form,
        title_multiloc: {
          'en' => 'Select the languages that you speak',
          'nl-NL' => 'Selecteer de talen die u spreekt'
        }
      )
    end
    let(:custom_field_option2) do
      create(
        :custom_field_option,
        custom_field: custom_field_multiselect,
        title_multiloc: { 'en' => 'Option 2', 'nl-NL' => 'Optie 2' }
      )
    end
    let(:custom_field_option3) do
      create(
        :custom_field_option,
        custom_field: custom_field_multiselect,
        title_multiloc: { 'en' => 'Option 3', 'nl-NL' => 'Optie 3' }
      )
    end

    let(:custom_field_multiselect_image) do
      create(
        :custom_field_multiselect_image,
        resource: form,
        title_multiloc: { 'en' => 'Select the best photo', 'nl-NL' => 'Selecteer de beste foto' }
      )
    end
    let(:custom_field_option4) do
      create(
        :custom_field_option,
        custom_field: custom_field_multiselect_image,
        title_multiloc: { 'en' => 'Option 4', 'nl-NL' => 'Optie 4' }
      )
    end
    let(:custom_field_option5) do
      create(:custom_field_option,
        custom_field: custom_field_multiselect_image,
        title_multiloc: { 'en' => 'Option 5', 'nl-NL' => 'Optie 5' })
    end

    let(:custom_field_linear_scale) do
      create(
        :custom_field_linear_scale,
        resource: form,
        title_multiloc: { 'en' => 'Rate your satisfaction', 'nl-NL' => 'Beoordeel uw tevredenheid' }
      )
    end

    let(:custom_field_number) do
      create(
        :custom_field_number,
        resource: form,
        title_multiloc: { 'en' => 'What size shoes do you use?', 'nl-NL' => 'Welke maat schoenen gebruik je?' }
      )
    end

    let(:custom_field_file_upload) do
      create(
        :custom_field_file_upload,
        resource: form,
        title_multiloc: { 'en' => 'Upload the photo', 'nl-NL' => 'Upload de foto' }
      )
    end

    let(:custom_field_point) do
      create(
        :custom_field_point,
        resource: form,
        title_multiloc: { 'en' => 'Mark the location on the map', 'nl-NL' => 'Markeer de locatie op de kaart' }
      )
    end

    let(:custom_field_line) do
      create(
        :custom_field_line,
        resource: form,
        title_multiloc: { 'en' => 'Draw the route on the map', 'nl-NL' => 'Teken de route op de kaart' }
      )
    end

    let(:custom_field_polygon) do
      create(
        :custom_field_polygon,
        resource: form,
        title_multiloc: { 'en' => 'Draw the area on the map', 'nl-NL' => 'Teken het gebied op de kaart' }
      )
    end

    let(:custom_field_gender) do
      create(
        :custom_field_gender,
        title_multiloc: { 'en' => 'Gender', 'nl-NL' => 'Geslacht' }
      )
    end
    let!(:custom_field_option_female) do
      create(:custom_field_option,
        custom_field: custom_field_gender,
        key: 'female',
        title_multiloc: { 'en' => 'Female', 'nl-NL' => 'Vrouw' })
    end

    let!(:custom_field_domicile) do
      create(
        :custom_field_domicile,
        title_multiloc: { 'en' => 'Place of residence', 'nl-NL' => 'Woonplaats' }
      )
    end
    let!(:area) { create(:area, title_multiloc: { 'en' => 'Brussels', 'nl-NL' => 'Bruxelles' }) }

    let(:user) { create(:user, custom_field_values: { gender: 'female', domicile: area.id }) }

    let(:idea1) do
      create(
        :idea,
        author: user,
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
        author_id: nil,
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
      before do
        admin = create(:admin, locale: 'nl-NL')
        header_token_for admin
      end

      example_request 'Generate GeoJSON for responses to a mapping question' do
        assert_status 200
        json_response = json_parse(response_body)

        expect(json_response.keys).to eq %i[type features]
        expect(json_response[:type]).to eq('FeatureCollection')

        expect(json_response[:features]).to match_array([
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [1.1, 2.2] },
            properties: {
              ID: idea1.id,
              'Gepubliceerd op': idea1.published_at.strftime('%m/%d/%Y %H:%M:%S').to_s,
              'Wat is uw functie?': 'Text answer',
              'Wat zijn uw belangrijkste verantwoordelijkheden?': 'Multiline answer',
              'Selecteer uw favoriete kleur': 'Optie 1',
              'Selecteer de talen die u spreekt': ['Optie 2', 'Optie 3'],
              'Selecteer de beste foto': ['Optie 4', 'Optie 5'],
              'Beoordeel uw tevredenheid': 3,
              'Welke maat schoenen gebruik je?': 42,
              'Upload de foto': file.file.url,
              'Markeer de locatie op de kaart [Lengtegraad, Breedtegraad]': { type: 'Point', coordinates: [1.1, 2.2] },
              'Teken de route op de kaart [Lengtegraad, Breedtegraad]': { type: 'LineString', coordinates: [[1.1, 2.2], [3.3, 4.4]] },
              'Teken het gebied op de kaart [Lengtegraad, Breedtegraad]': {
                type: 'Polygon',
                coordinates: [[[1, 2], [3, 4], [5, 6], [1, 2]]]
              },
              user_data: {
                'Auteur-ID': idea1.author_id,
                'E-mail van auteur': idea1.author.email,
                'Auteur naam': idea1.author_name,
                Geslacht: 'Vrouw',
                Woonplaats: 'Bruxelles'
              }
            }
          },
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [3.3, 4.4] },
            properties: {
              ID: idea2.id,
              'Gepubliceerd op': idea2.published_at.strftime('%m/%d/%Y %H:%M:%S').to_s,
              'Wat is uw functie?': nil,
              'Wat zijn uw belangrijkste verantwoordelijkheden?': nil,
              'Selecteer uw favoriete kleur': nil,
              'Selecteer de talen die u spreekt': nil,
              'Selecteer de beste foto': nil,
              'Beoordeel uw tevredenheid': nil,
              'Welke maat schoenen gebruik je?': nil,
              'Upload de foto': nil,
              'Markeer de locatie op de kaart [Lengtegraad, Breedtegraad]': { type: 'Point', coordinates: [3.3, 4.4] },
              'Teken de route op de kaart [Lengtegraad, Breedtegraad]': nil,
              'Teken het gebied op de kaart [Lengtegraad, Breedtegraad]': nil,
              user_data: nil
            }
          }
        ])
      end

      context 'when custom field is not a geographic input type' do
        let(:custom_field_id) { custom_field_text.id }

        example '[Error] Generate GeoJSON for responses to a non-mapping question' do
          expect { do_request }.to raise_error(
            RuntimeError,
            "Custom field with input_type: 'text' is not a geographic type"
          )
        end
      end
    end

    context 'when regular user' do
      before { header_token_for create(:user) }

      example_request '[Unauthorized] Generate GeoJSON for responses to a mapping question' do
        assert_status 401
      end
    end
  end
end
