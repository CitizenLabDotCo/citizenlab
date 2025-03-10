# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Idea Custom Fields' do
  explanation 'Fields in idea forms which are customized by the city, scoped on the project level.'
  before { header 'Content-Type', 'application/json' }

  patch 'web_api/v1/admin/phases/:phase_id/custom_fields/update_all' do
    parameter :custom_fields, type: :array
    with_options scope: 'custom_fields[]' do
      parameter :id, 'The ID of an existing custom field to update. When the ID is not provided, a new field is created.', required: false
      parameter :input_type, 'The type of the input. Required when creating a new field.', required: false
      parameter :required, 'Whether filling out the field is mandatory', required: false
      parameter :enabled, 'Whether the field is active or not', required: false
      parameter :title_multiloc, 'A title of the field, as shown to users, in multiple locales', required: false
      parameter :description_multiloc, 'An optional description of the field, as shown to users, in multiple locales', required: false
      parameter :options, type: :array
    end
    with_options scope: 'options[]' do
      parameter :id, 'The ID of an existing custom field option to update. When the ID is not provided, a new option is created.', required: false
      parameter :title_multiloc, 'A title of the option, as shown to users, in multiple locales', required: false
      parameter :image_id, 'If the option has an image, the ID of the image', required: false
    end

    let(:first_page) do
      {
        id: '1234',
        key: 'page1',
        title_multiloc: { 'en' => 'First page' },
        input_type: 'page',
        page_layout: 'default'
      }
    end

    let(:last_page) do
      {
        id: '1234',
        key: 'survey_end',
        title_multiloc: { 'en' => 'Final page' },
        description_multiloc: { 'en' => 'Thank you for participating!' },
        input_type: 'page',
        page_layout: 'default'
      }
    end

    let(:context) { create(:community_monitor_survey_phase) }
    let!(:custom_form) { create(:custom_form, participation_context: context) }
    let(:phase_id) { context.id }

    context 'when admin' do
      before { admin_header_token }

      example 'Insert one field, update one field, and destroy one field' do
        field_to_update = create(:custom_field_rating, resource: custom_form, title_multiloc: { 'en' => 'Rating field' })
        create(:custom_field, resource: custom_form) # field to destroy
        request = {
          custom_fields: [
            first_page,
            # Updated field
            {
              id: field_to_update.id,
              title_multiloc: { 'en' => 'Updated rating field' },
              description_multiloc: { 'en' => 'Updated description' },
              required: true,
              enabled: true,
              maximum: 7
            },
            # Inserted field first to test reordering of fields.
            {
              input_type: 'text',
              title_multiloc: { 'en' => 'Inserted field' },
              required: false,
              enabled: false
            },
            last_page
          ]
        }
        do_request request

        assert_status 200
        expect(response_data.size).to eq 4
        expect(response_data[1]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: { en: 'Updated description' },
            enabled: true,
            input_type: 'rating',
            key: field_to_update.key,
            ordering: 1,
            required: true,
            title_multiloc: { en: 'Updated rating field' },
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {},
            random_option_ordering: false,
            maximum: 7
          },
          id: an_instance_of(String),
          type: 'custom_field',
          relationships: { options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
        })
        expect(response_data[2]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: {},
            enabled: false,
            input_type: 'text',
            key: Regexp.new('inserted_field'),
            ordering: 2,
            required: false,
            title_multiloc: { en: 'Inserted field' },
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {},
            random_option_ordering: false
          },
          id: an_instance_of(String),
          type: 'custom_field',
          relationships: { options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
        })
      end

      context 'Errors' do
        example 'Unsupported field types' do
          request = {
            custom_fields: [
              first_page,
              { input_type: 'multiselect_image', title_multiloc: { en: 'Not allowed' } },
              { input_type: 'html_multiloc', title_multiloc: { en: 'Not allowed' } },
              last_page
            ]
          }
          do_request request
          assert_status 422
          expect(json_response_body.dig(:errors, :'1')).to eq(
            { input_type: [{ error: 'inclusion', value: 'multiselect_image' }] }
          )
          expect(json_response_body.dig(:errors, :'2')).to eq(
            { input_type: [{ error: 'inclusion', value: 'html_multiloc' }] }
          )
        end

        example 'First page & last page must be present' do
          request = {
            custom_fields: [
              { input_type: 'text', title_multiloc: { en: 'Text field' } },
              { input_type: 'text', title_multiloc: { en: 'Text field' } }
            ]
          }
          do_request request
          assert_status 422
          expect(json_response_body.dig(:errors, :'0')).to eq(
            { structure: [{ error: "First field must be of type 'page'" }] }
          )
          expect(json_response_body.dig(:errors, :'1')).to eq(
            { structure: [{ error: "Last field must be of type 'page'" }] }
          )
        end
      end
    end
  end
end
