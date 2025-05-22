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
      parameter :ask_follow_up, 'Whether to ask a follow-up question after this field', required: false
      parameter :question_category, 'The category of the question', required: false
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
        page_layout: 'default',
        include_in_printed_form: true
      }
    end

    let(:last_page) do
      {
        id: '1234',
        key: 'form_end',
        title_multiloc: { 'en' => 'Final page' },
        description_multiloc: { 'en' => 'Thank you for participating!' },
        input_type: 'page',
        page_layout: 'default',
        include_in_printed_form: false
      }
    end

    let(:phase) { create(:community_monitor_survey_phase) }
    let!(:custom_form) { create(:custom_form, participation_context: phase) }
    let(:phase_id) { phase.id }

    context 'when admin' do
      before { admin_header_token }

      example 'Insert one field, update one field, and destroy one field' do
        field_to_update = create(:custom_field_sentiment_linear_scale, resource: custom_form, title_multiloc: { 'en' => 'Sentiment field' })
        create(:custom_field_page, resource: custom_form) # field to destroy
        request = {
          custom_fields: [
            first_page,
            # Updated field
            {
              id: field_to_update.id,
              title_multiloc: { 'en' => 'Updated sentiment field' },
              description_multiloc: { 'en' => 'Updated description' },
              required: true,
              enabled: true,
              ask_follow_up: true,
              question_category: 'quality_of_life'
            },
            # Inserted field.
            {
              input_type: 'page',
              title_multiloc: { 'en' => 'Inserted page field' },
              page_layout: 'default',
              key: 'inserted_page_field',
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
            input_type: 'sentiment_linear_scale',
            key: field_to_update.key,
            ordering: 1,
            required: true,
            title_multiloc: { en: 'Updated sentiment field' },
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {},
            random_option_ordering: false,
            maximum: 5,
            ask_follow_up: true,
            linear_scale_label_1_multiloc: { en: 'Strongly disagree' },
            linear_scale_label_2_multiloc: { en: 'Disagree' },
            linear_scale_label_3_multiloc: { en: 'Neutral' },
            linear_scale_label_4_multiloc: { en: 'Agree' },
            linear_scale_label_5_multiloc: { en: 'Strongly agree' },
            linear_scale_label_6_multiloc: {},
            linear_scale_label_7_multiloc: {},
            linear_scale_label_8_multiloc: {},
            linear_scale_label_9_multiloc: {},
            linear_scale_label_10_multiloc: {},
            linear_scale_label_11_multiloc: {},
            question_category: 'quality_of_life',
            include_in_printed_form: true
          },
          id: an_instance_of(String),
          type: 'custom_field',
          relationships: {
            options: { data: [] },
            resource: { data: { id: custom_form.id, type: 'custom_form' } }
          }
        })
        expect(response_data[2]).to match({
          attributes: {
            code: nil,
            created_at: an_instance_of(String),
            description_multiloc: {},
            enabled: false,
            input_type: 'page',
            key: 'inserted_page_field',
            ordering: 2,
            required: false,
            title_multiloc: { en: 'Inserted page field' },
            updated_at: an_instance_of(String),
            logic: {},
            constraints: {},
            random_option_ordering: false,
            page_layout: 'default',
            question_category: 'other',
            include_in_printed_form: true
          },
          id: an_instance_of(String),
          type: 'custom_field',
          relationships: {
            map_config: { data: nil },
            options: { data: [] },
            resource: { data: { id: custom_form.id, type: 'custom_form' } }
          }
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

        example '[error] first custom field is not a page' do
          request = {
            custom_fields: [
              { input_type: 'sentiment_linear_scale', title_multiloc: { en: 'First field' } },
              { input_type: 'sentiment_linear_scale', title_multiloc: { en: 'Second field' } },
              last_page
            ]
          }
          do_request request

          assert_status 422
          json_response = json_parse response_body
          expect(json_response).to eq({ errors: { form: [{ error: 'no_first_page' }] } })
        end
      end
    end
  end
end
