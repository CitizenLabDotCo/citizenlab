require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Ideas' do
  explanation 'Proposals from citizens to the city.'

  before { header 'Content-Type', 'application/json' }

  get 'web_api/v1/ideas/:idea_id/json_forms_schema' do
    context 'in an ideation phase' do
      let(:project) { create(:project_with_active_ideation_phase) }
      let(:idea) { create(:idea, project: project) }
      let(:idea_id) { idea.id }

      context 'when resident' do
        before { resident_header_token }

        let!(:custom_form) { create(:custom_form, :with_default_fields, participation_context: project) }
        let!(:custom_field) { create(:custom_field, resource: custom_form) }

        example_request 'Get the jsonforms.io json schema and ui schema for an ideation input' do
          assert_status 200
          json_response = json_parse response_body
          expect(json_response.dig(:data, :type)).to eq 'json_forms_schema'
          json_attributes = json_response.dig(:data, :attributes)
          expect(json_attributes[:json_schema_multiloc].keys).to eq %i[en fr-FR nl-NL]
          expect(json_attributes[:ui_schema_multiloc].keys).to eq %i[en fr-FR nl-NL]
          visible_built_in_field_keys = %i[
            title_multiloc
            body_multiloc
            idea_images_attributes
            idea_files_attributes
            topic_ids
            location_description
          ]
          %i[en fr-FR nl-NL].each do |locale|
            expect(json_attributes[:json_schema_multiloc][locale][:properties].keys).to eq(visible_built_in_field_keys + [custom_field.key.to_sym])
          end
        end
      end

      context 'when admin' do
        before { admin_header_token }

        example 'Get the json schema and ui schema for an ideation input with author field', document: false do
          SettingsService.new.activate_feature! 'idea_author_change'
          do_request

          assert_status 200
          json_response = json_parse response_body
          json_schema = json_response.dig(:data, :attributes, :json_schema_multiloc)
          ui_schema = json_response.dig(:data, :attributes, :ui_schema_multiloc)
          expect(json_schema.keys).to eq %i[en fr-FR nl-NL]
          expect(ui_schema.keys).to eq %i[en fr-FR nl-NL]
          { 'en' => 'Author', 'fr-FR' => 'Auteur', 'nl-NL' => 'Auteur' }.each do |locale, author_label|
            author_ui_elt = ui_schema.dig(locale.to_sym, :elements, 0, :elements, 0)
            expect(author_ui_elt).to match({
              type: 'Control',
              scope: '#/properties/author_id',
              label: author_label,
              options: {
                description: '',
                input_type: 'text',
                isAdminField: true,
                hasRule: false,
                answer_visible_to: 'public',
                transform: 'trim_on_blur'
              }
            })
          end
        end
      end
    end
  end
end
