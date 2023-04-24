# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Idea Custom Fields' do
  explanation 'Fields in idea forms which are customized by the city, scoped on the project level.'
  before { header 'Content-Type', 'application/json' }

  get 'web_api/v1/admin/projects/:project_id/custom_fields' do
    let(:context) { create(:project) }
    let(:project_id) { context.id }
    let!(:form) { create(:custom_form, :with_default_fields, participation_context: context) }
    let!(:custom_field) { create(:custom_field, resource: form, key: 'extra_field1') }

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
    end
  end
end
