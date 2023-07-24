# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Idea Custom Fields' do
  explanation 'Fields in idea forms which are customized by the city, scoped on the project level.'
  before { header 'Content-Type', 'application/json' }

  get 'web_api/v1/admin/projects/:project_id/custom_fields' do
    parameter :support_free_text_value, 'Only return custom fields that have a freely written textual answer', type: :boolean, required: false

    let(:context) { create(:project) }
    let(:project_id) { context.id }
    let!(:form) { create(:custom_form, :with_default_fields, participation_context: context) }
    let!(:custom_field) { create(:custom_field_text, resource: form, key: 'extra_field1') }

    context 'when admin' do
      before { admin_header_token }

      example_request 'List all allowed custom fields for a project' do
        assert_status 200
        json_response = json_parse response_body
        expect(json_response[:data].size).to eq 11
        expect(json_response[:data].map { |d| d.dig(:attributes, :key) }).to eq [
          nil, 'title_multiloc', 'body_multiloc',
          nil, 'idea_images_attributes', 'idea_files_attributes',
          nil, 'topic_ids', 'location_description', 'proposed_budget',
          custom_field.key
        ]
      end

      example 'List custom fields in the correct order', document: false do
        create(:custom_field, resource: form, key: 'extra_field2')
        do_request
        assert_status 200
        json_response = json_parse response_body
        expect(json_response[:data].map { |d| d.dig(:attributes, :key) }).to eq [
          nil, 'title_multiloc', 'body_multiloc',
          nil, 'idea_images_attributes', 'idea_files_attributes',
          nil, 'topic_ids', 'location_description', 'proposed_budget',
          'extra_field1', 'extra_field2'
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
    end
  end
end
