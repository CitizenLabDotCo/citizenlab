# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Idea Custom Fields' do
  explanation 'Fields in idea forms which are customized by the city, scoped on the project level.'

  before { header 'Content-Type', 'application/json' }

  patch 'web_api/v1/projects/:project_id/custom_fields/update_all' do
    parameter :custom_fields, type: :array
    with_options scope: 'custom_fields[]' do
      parameter :id, 'The ID of an existing custom field to update. When the ID is not provided, a new field is created.', required: false
      parameter :code, 'The code of a default field.', required: false
      parameter :input_type, 'The type of the input. Required when creating a new field.', required: false
      parameter :required, 'Whether filling out the field is mandatory', required: false
      parameter :enabled, 'Whether the field is active or not', required: false
      parameter :title_multiloc, 'A title of the field, as shown to users, in multiple locales', required: false
      parameter :description_multiloc, 'An optional description of the field, as shown to users, in multiple locales', required: false
      parameter :options, type: :array
      parameter :logic, 'The logic JSON for the field'
    end
    with_options scope: 'options[]' do
      parameter :id, 'The ID of an existing custom field option to update. When the ID is not provided, a new option is created.', required: false
      parameter :title_multiloc, 'A title of the option, as shown to users, in multiple locales', required: false
    end

    let(:context) { create(:single_phase_ideation_project) }
    let(:project_id) { context.id }
    let(:participation_method) { context.pmethod }
    let(:default_fields_param) do
      attributes = %i[id code input_type title_multiloc description_multiloc required enabled page_layout]
      # Remove the end_page. We will add that manually in the tests
      IdeaCustomFieldsService.new(custom_form).all_fields.reject(&:form_end_page?).map do |field|
        {}.tap do |field_param|
          attributes.each do |attribute|
            field_param[attribute] = field.send attribute
          end
        end
      end
    end
    let(:final_page) do
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

    context 'when admin' do
      before { admin_header_token }

      context 'when the form is persisted for the first time' do
        let(:custom_form) { create(:custom_form, participation_context: context) }

        example 'Updating custom fields', document: false do
          create(:idea, project: context)
          custom_description = { 'en' => 'Custom description' }

          do_request(
            custom_fields: default_fields_param.tap do |params|
              params[1][:description_multiloc] = custom_description
              params << final_page
            end
          )

          assert_status 200
          json_response = json_parse response_body
          expect(json_response[:data].size).to eq 12
          expect(context.reload.custom_form.custom_fields[1].description_multiloc).to eq custom_description
        end
      end

      context 'when the form has been persisted before' do
        let!(:custom_form) { create(:custom_form, :with_default_fields, participation_context: context) }

        example 'Add, update and remove a field' do
          fields_param = default_fields_param # https://stackoverflow.com/a/58695857/3585671
          # Update persisted built-in field
          fields_param[1][:description_multiloc] = { 'en' => 'New title description' }
          # Remove extra field
          deleted_field = create(:custom_field_linear_scale, :for_custom_form)
          # Add extra field
          fields_param += [
            {
              input_type: 'page',
              title_multiloc: { 'en' => 'Extra fields' },
              page_layout: 'default'
            },
            {
              input_type: 'select',
              title_multiloc: { 'en' => 'Select field title' },
              description_multiloc: { 'en' => 'Select field description' },
              required: false,
              enabled: true,
              options: [
                { title_multiloc: { 'en' => 'Field 1' } },
                { title_multiloc: { 'en' => 'Field 2' } }
              ]
            },
            final_page
          ]

          do_request custom_fields: fields_param

          assert_status 200
          json_response = json_parse response_body

          expect(json_response[:data].size).to eq 14
          expect(json_response[:data].pluck(:id)).not_to include(deleted_field.id)
          expect(json_response[:data]).to match([
            hash_including(
              attributes: hash_including(
                code: 'title_page',
                key: nil,
                input_type: 'page',
                title_multiloc: { en: 'What is your idea?', 'fr-FR': 'Quelle est votre idée ?', 'nl-NL': 'Wat is je idee?' },
                description_multiloc: {},
                ordering: 0,
                required: false,
                enabled: true,
                created_at: an_instance_of(String),
                updated_at: an_instance_of(String),
                logic: {},
                constraints: {
                  locks: {
                    enabled: true,
                    title_multiloc: true
                  }
                },
                page_layout: 'default',
                random_option_ordering: false
              ),
              id: an_instance_of(String),
              type: 'custom_field',
              relationships: { options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } }, map_config: { data: nil } }
            ),
            hash_including(
              attributes: hash_including(
                code: 'title_multiloc',
                key: 'title_multiloc',
                input_type: 'text_multiloc',
                title_multiloc: hash_including(en: 'Title'),
                description_multiloc: { en: 'New title description' },
                ordering: 1,
                required: true,
                enabled: true,
                created_at: an_instance_of(String),
                updated_at: an_instance_of(String),
                logic: {},
                constraints: {
                  locks: {
                    enabled: true,
                    title_multiloc: true,
                    required: true
                  }
                },
                random_option_ordering: false
              ),
              id: an_instance_of(String),
              type: 'custom_field',
              relationships: { options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
            ),
            hash_including(
              attributes: hash_including(
                code: 'body_page',
                key: nil,
                input_type: 'page',
                title_multiloc: hash_including(en: 'Tell us more', 'fr-FR': 'Dites-nous plus', 'nl-NL': 'Vertel ons meer'),
                description_multiloc: {},
                ordering: 2,
                required: false,
                enabled: true,
                created_at: an_instance_of(String),
                updated_at: an_instance_of(String),
                logic: {},
                constraints: {},
                page_layout: 'default',
                random_option_ordering: false
              ),
              id: an_instance_of(String),
              type: 'custom_field',
              relationships: { options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } }, map_config: { data: nil } }
            ),
            hash_including(
              attributes: hash_including(
                code: 'body_multiloc',
                key: 'body_multiloc',
                input_type: 'html_multiloc',
                title_multiloc: hash_including(en: 'Description'),
                ordering: 3,
                description_multiloc: {},
                required: true,
                enabled: true,
                created_at: an_instance_of(String),
                updated_at: an_instance_of(String),
                logic: {},
                constraints: {
                  locks: {
                    enabled: true,
                    required: true,
                    title_multiloc: true
                  }
                },
                random_option_ordering: false
              ),
              id: an_instance_of(String),
              type: 'custom_field',
              relationships: { options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
            ),
            hash_including(
              attributes: hash_including(
                code: 'uploads_page',
                key: nil,
                input_type: 'page',
                ordering: 4
              )
            ),
            hash_including(attributes: hash_including(code: 'idea_images_attributes', key: 'idea_images_attributes', input_type: 'image_files', ordering: 5)),
            hash_including(attributes: hash_including(code: 'idea_files_attributes', key: 'idea_files_attributes', input_type: 'files', ordering: 6)),
            hash_including(attributes: hash_including(code: 'details_page', key: nil, input_type: 'page', ordering: 7)),
            hash_including(attributes: hash_including(code: 'topic_ids', key: 'topic_ids', input_type: 'topic_ids', ordering: 8)),
            hash_including(attributes: hash_including(code: 'location_description', key: 'location_description', input_type: 'text', ordering: 9)),
            hash_including(attributes: hash_including(code: 'proposed_budget', key: 'proposed_budget', input_type: 'number', ordering: 10)),
            hash_including(attributes: hash_including(code: nil, key: nil, input_type: 'page', ordering: 11, title_multiloc: { en: 'Extra fields' })),
            hash_including(
              attributes: hash_including(
                code: nil,
                key: Regexp.new('select_field_title'),
                input_type: 'select',
                ordering: 12,
                title_multiloc: { en: 'Select field title' },
                description_multiloc: { en: 'Select field description' },
                required: false,
                enabled: true,
                created_at: an_instance_of(String),
                updated_at: an_instance_of(String),
                logic: {},
                constraints: {}
              ),
              type: 'custom_field',
              relationships: { options: { data: [
                hash_including(id: an_instance_of(String), type: 'custom_field_option'),
                hash_including(id: an_instance_of(String), type: 'custom_field_option')
              ] }, resource: { data: { id: custom_form.id, type: 'custom_form' } } }
            ),
            hash_including(
              attributes: hash_including(
                code: nil,
                key: 'form_end',
                input_type: 'page',
                title_multiloc: { en: 'Final page' },
                description_multiloc: { en: 'Thank you for participating!' },
                ordering: 13,
                required: false,
                enabled: true,
                created_at: an_instance_of(String),
                updated_at: an_instance_of(String),
                logic: {},
                constraints: {},
                page_layout: 'default',
                random_option_ordering: false
              ),
              id: an_instance_of(String),
              type: 'custom_field',
              relationships: { options: { data: [] }, resource: { data: { id: custom_form.id, type: 'custom_form' } }, map_config: { data: nil } }
            )
          ])
        end

        example '[error] Add a field of unsupported input_type' do
          fields_param = default_fields_param # https://stackoverflow.com/a/58695857/3585671
          # Add extra field
          fields_param += [
            {
              input_type: 'page',
              title_multiloc: { 'en' => 'Extra fields' },
              page_layout: 'default'
            },
            {
              input_type: 'html_multiloc',
              title_multiloc: { 'en' => 'HTML multliloc field title' },
              description_multiloc: { 'en' => 'HTML multliloc field description' },
              required: false,
              enabled: true
            },
            final_page
          ]

          do_request custom_fields: fields_param

          assert_status 422
          json_response = json_parse response_body
          expect(json_response).to eq({ errors: { '12': { input_type: [{ error: 'inclusion', value: 'html_multiloc' }] } } })
        end

        example '[error] Submitting an empty form' do
          do_request custom_fields: []

          assert_status 422
          json_response = json_parse response_body
          expect(json_response).to eq({ errors: { form: [{ error: 'empty' }] } })
        end

        example '[error] Put the title and body fields on the same page' do
          title_field, body_field = default_fields_param.select { |field| field[:code].in? %w[title_multiloc body_multiloc] }
          fields_param = [
            {
              input_type: 'page',
              page_layout: 'default'
            },
            title_field,
            body_field,
            final_page
          ]

          do_request custom_fields: fields_param

          assert_status 422
          json_response = json_parse response_body
          expect(json_response).to eq({ errors: { form: [{ error: 'title_and_body_on_same_page' }] } })
        end

        example '[error] Put other fields on the title page' do
          title_field, body_field = default_fields_param.select { |field| field[:code].in? %w[title_multiloc body_multiloc] }
          fields_param = [
            {
              input_type: 'page',
              page_layout: 'default'
            },
            title_field,
            {
              input_type: 'number',
              title_multiloc: { 'en' => 'How many?' }
            },
            {
              input_type: 'page',
              page_layout: 'default'
            },
            body_field,
            final_page
          ]

          do_request custom_fields: fields_param

          assert_status 422
          json_response = json_parse response_body
          expect(json_response).to eq({ errors: { form: [{ error: 'title_page_with_other_fields' }] } })
        end

        example 'Put other disabled fields on the title page', document: false do
          title_field, body_field = default_fields_param.select { |field| field[:code].in? %w[title_multiloc body_multiloc] }
          fields_param = [
            {
              input_type: 'page',
              page_layout: 'default'
            },
            title_field,
            {
              input_type: 'number',
              enabled: false,
              title_multiloc: { 'en' => 'How many?' }
            },
            {
              input_type: 'page',
              page_layout: 'default'
            },
            body_field,
            final_page
          ]

          do_request custom_fields: fields_param

          assert_status 200
        end

        example '[error] Put other fields on the body page' do
          title_field, body_field, topics_field = default_fields_param.select { |field| field[:code].in? %w[title_multiloc body_multiloc topic_ids] }
          fields_param = [
            {
              input_type: 'page',
              page_layout: 'default'
            },
            title_field,
            {
              input_type: 'page',
              page_layout: 'default'
            },
            topics_field,
            body_field,
            final_page
          ]

          do_request custom_fields: fields_param

          assert_status 422
          json_response = json_parse response_body
          expect(json_response).to eq({ errors: { form: [{ error: 'body_page_with_other_fields' }] } })
        end

        example 'Put other disabled fields on the body page', document: false do
          title_field, body_field = default_fields_param.select { |field| field[:code].in? %w[title_multiloc body_multiloc] }
          fields_param = [
            {
              input_type: 'page',
              page_layout: 'default'
            },
            title_field,
            {
              input_type: 'page',
              page_layout: 'default'
            },
            {
              input_type: 'number',
              enabled: false,
              title_multiloc: { 'en' => 'How many?' }
            },
            body_field,
            {
              input_type: 'number',
              enabled: false,
              title_multiloc: { 'en' => 'How many?' }
            },
            final_page
          ]

          do_request custom_fields: fields_param

          assert_status 200
        end

        example 'Updating custom fields when there are responses', document: false do
          create(:idea, project: context)
          custom_description = { 'en' => 'Custom description' }

          do_request(
            custom_fields: default_fields_param.tap do |params|
              params[1][:description_multiloc] = custom_description
              params << final_page
            end
          )

          assert_status 200
          expect(context.reload.custom_form.custom_fields[1].description_multiloc).to eq custom_description
        end
      end
    end

    context 'when resident' do
      before { resident_header_token }

      let(:custom_form) { create(:custom_form, participation_context: context) }

      example '[error] Updating custom fields', document: false do
        create(:idea, project: context)
        custom_description = { 'en' => 'Custom description' }

        do_request(
          custom_fields: default_fields_param.tap do |params|
            params[1][:description_multiloc] = custom_description
            params << final_page
          end
        )

        assert_status 401
      end
    end
  end
end
