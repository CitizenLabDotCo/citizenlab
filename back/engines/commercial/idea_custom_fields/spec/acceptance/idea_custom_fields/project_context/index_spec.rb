# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Idea Custom Fields' do
  explanation 'Fields in idea forms which are customized by the city, scoped on the project level.'
  before do
    header 'Content-Type', 'application/json'
    SettingsService.new.activate_feature! 'idea_custom_fields'
  end

  get 'web_api/v1/admin/projects/:project_id/custom_fields' do
    let(:context) { create :project }
    let(:project_id) { context.id }
    let(:form) { create :custom_form, participation_context: context }
    let!(:custom_field) { create :custom_field, resource: form, key: 'extra_field1' }

    context 'when admin' do
      before { admin_header_token }

      example_request 'List all allowed custom fields for a project' do
        assert_status 200
        json_response = json_parse response_body
        expect(json_response[:data].size).to eq 8
        expect(json_response[:data].map { |d| d.dig(:attributes, :key) }).to eq [
          'title_multiloc', 'body_multiloc', 'proposed_budget', 'topic_ids',
          'location_description', 'idea_images_attributes', 'idea_files_attributes', custom_field.key
        ]
      end

      example 'List custom fields in the correct order', document: false do
        create :custom_field, resource: form, code: 'title_multiloc', key: 'title_multiloc'
        create :custom_field, resource: form, key: 'extra_field2'
        do_request
        assert_status 200
        json_response = json_parse response_body
        expect(json_response[:data].map { |d| d.dig(:attributes, :key) }).to eq %w[
          title_multiloc body_multiloc proposed_budget topic_ids location_description
          idea_images_attributes idea_files_attributes extra_field1 extra_field2
        ]
      end
    end
  end
end
