require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Idea Custom Fields' do
  explanation 'Fields in idea forms which are customized by the city, scoped on the project level.'

  before { header 'Content-Type', 'application/json' }

  get 'web_api/v1/phases/:phase_id/custom_fields/:custom_field_id/as_geojson' do
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
              id: idea1.id,
              gepubliceerd_op: idea1.published_at.strftime('%m/%d/%Y %H:%M:%S').to_s,
              wat_is_uw_functie: 'Text answer',
              wat_zijn_uw_belangrijkste_verantwoordelijkheden: 'Multiline answer',
              selecteer_uw_favoriete_kleur: 'Optie 1',
              selecteer_de_talen_die_u_spreekt: ['Optie 2', 'Optie 3'],
              selecteer_de_beste_foto: ['Optie 4', 'Optie 5'],
              beoordeel_uw_tevredenheid: 3,
              welke_maat_schoenen_gebruik_je: 42,
              upload_de_foto: file.file.url,
              markeer_de_locatie_op_de_kaart: { type: 'Point', coordinates: [1.1, 2.2] },
              teken_de_route_op_de_kaart: { type: 'LineString', coordinates: [[1.1, 2.2], [3.3, 4.4]] },
              teken_het_gebied_op_de_kaart: {
                type: 'Polygon',
                coordinates: [[[1, 2], [3, 4], [5, 6], [1, 2]]]
              },
              gebruikersgegevens__auteur_id: idea1.author_id,
              gebruikersgegevens__e_mail_van_auteur: idea1.author.email,
              gebruikersgegevens__auteur_naam: idea1.author_name,
              gebruikersgegevens__geslacht: 'Vrouw',
              gebruikersgegevens__woonplaats: 'Bruxelles'
            }
          },
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [3.3, 4.4] },
            properties: {
              id: idea2.id,
              gepubliceerd_op: idea2.published_at.strftime('%m/%d/%Y %H:%M:%S').to_s,
              wat_is_uw_functie: nil,
              wat_zijn_uw_belangrijkste_verantwoordelijkheden: nil,
              selecteer_uw_favoriete_kleur: nil,
              selecteer_de_talen_die_u_spreekt: nil,
              selecteer_de_beste_foto: nil,
              beoordeel_uw_tevredenheid: nil,
              welke_maat_schoenen_gebruik_je: nil,
              upload_de_foto: nil,
              markeer_de_locatie_op_de_kaart: { type: 'Point', coordinates: [3.3, 4.4] },
              teken_de_route_op_de_kaart: nil,
              teken_het_gebied_op_de_kaart: nil
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
