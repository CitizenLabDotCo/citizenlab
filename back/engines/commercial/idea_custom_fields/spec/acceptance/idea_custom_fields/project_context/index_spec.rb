# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Idea Custom Fields' do
  explanation 'Fields in idea forms which are customized by the city, scoped on the project level.'
  before { header 'Content-Type', 'application/json' }

  get 'web_api/v1/admin/projects/:project_id/custom_fields' do
    parameter :support_free_text_value, 'Only return custom fields that have a freely written textual answer', type: :boolean, required: false
    parameter :input_types, 'Filter custom fields by input types', type: :array, items: { type: :string }, required: false

    let(:context) { create(:single_phase_ideation_project) }
    let(:project_id) { context.id }
    let!(:form) { create(:custom_form, :with_default_fields, participation_context: context) }
    let!(:custom_field) { create(:custom_field_text, resource: form, key: 'extra_field1') }

    context 'when admin' do
      before { admin_header_token }

      example_request 'List all allowed custom fields for a project' do
        assert_status 200
        json_response = json_parse response_body
        expect(json_response[:data].size).to eq 13
        expect(json_response[:data].map { |d| d.dig(:attributes, :key) }).to eq [
          nil, 'title_multiloc',
          nil, 'body_multiloc',
          nil, 'idea_images_attributes', 'idea_files_attributes',
          nil, 'topic_ids', 'location_description', 'proposed_budget',
          custom_field.key, 'form_end'
        ]
      end

      example 'List custom fields in the correct order', document: false do
        create(:custom_field, resource: form, key: 'extra_field2')
        do_request
        assert_status 200
        json_response = json_parse response_body
        expect(json_response[:data].map { |d| d.dig(:attributes, :key) }).to eq [
          nil, 'title_multiloc',
          nil, 'body_multiloc',
          nil, 'idea_images_attributes', 'idea_files_attributes',
          nil, 'topic_ids', 'location_description', 'proposed_budget',
          'extra_field1', 'extra_field2', 'form_end'
        ]
      end

      example 'List all allowed custom fields for a project with a textual answer', document: false do
        cf_number = create(:custom_field_date, resource: form, key: 'extra_field2')
        do_request(support_free_text_value: true)
        assert_status 200
        json_response = json_parse response_body
        expect(json_response[:data].map { |d| d.dig(:attributes, :key) }).to include custom_field.key
        expect(json_response[:data].map { |d| d.dig(:attributes, :key) }).not_to include cf_number.key
      end

      example 'List all allowed custom fields for a project that has no custom_form', document: false do
        form.destroy!
        do_request(support_free_text_value: true)
        assert_status 200
        json_response = json_parse response_body
        expect(json_response[:data].map { |d| d.dig(:attributes, :key) }).not_to be_empty
      end

      example 'List all relevant custom fields for a phase with a filter on input_types' do
        do_request(input_types: ['number'])
        assert_status 200
        expect(response_data.size).to eq 1
        expect(response_data.map { |d| d.dig(:attributes, :key) }).to eq [
          'proposed_budget'
        ]
      end

      example 'List input fields in project for groups not including user' do
        context.update!(visible_to: 'groups')
        do_request
        assert_status 200
        expect(response_data.size).to eq 13
      end
    end

    context 'when resident' do
      let!(:hidden_field) { create(:custom_field_text, resource: form, key: 'extra_field2', hidden: true) }
      let!(:disabled_field) { create(:custom_field_text, resource: form, key: 'extra_field3', enabled: false) }

      let(:user) { create(:user) }

      before { header_token_for(user) }

      example_request 'List all allowed custom fields for a project' do
        assert_status 200
        json_response = json_parse response_body
        expect(json_response[:data].size).to eq 12
        expect(json_response[:data].map { |d| d.dig(:attributes, :key) }).to eq [
          nil, 'title_multiloc',
          nil, 'body_multiloc',
          nil, 'idea_images_attributes', 'idea_files_attributes',
          nil, 'topic_ids', 'location_description',
          'extra_field1', 'form_end'
        ]
      end

      example '[Unauthorized] List input fields in admin only project' do
        context.update!(visible_to: 'admins')
        do_request
        assert_status 401
      end

      example '[Unauthorized] List input fields in project for groups not including user' do
        context.update!(visible_to: 'groups')
        do_request
        assert_status 401
      end

      example 'List survey fields in project for groups including user' do
        context.update!(visible_to: 'groups')
        group = create(:group)
        create(:membership, group: group, user: user)
        create(:groups_project, group: group, project: context)
        do_request
        assert_status 200
        expect(response_data.size).to eq 12
      end
    end
  end
end
