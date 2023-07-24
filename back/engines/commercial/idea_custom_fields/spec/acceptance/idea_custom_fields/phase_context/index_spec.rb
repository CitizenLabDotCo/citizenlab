# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Idea Custom Fields' do
  explanation 'Fields in idea forms which are customized by the city, scoped on the project level.'

  before { header 'Content-Type', 'application/json' }

  get 'web_api/v1/admin/phases/:phase_id/custom_fields' do
    parameter :support_free_text_value, 'Only return custom fields that have a freely written textual answer', type: :boolean, required: false

    let(:context) { create(:phase, participation_method: 'native_survey') }
    let(:phase_id) { context.id }
    let(:form) { create(:custom_form, participation_context: context) }
    let!(:custom_field1) { create(:custom_field_text, resource: form, key: 'extra_field1') }
    let!(:custom_field2) { create(:custom_field_number, resource: form, key: 'extra_field2') }

    context 'when admin' do
      before { admin_header_token }

      example_request 'List all allowed custom fields for a phase' do
        assert_status 200
        json_response = json_parse response_body
        expect(json_response[:data].size).to eq 2
        expect(json_response[:data].map { |d| d.dig(:attributes, :key) }).to eq [
          custom_field1.key,
          custom_field2.key
        ]
      end

      example 'List all allowed custom fields for a phase with a textual answer', document: false do
        do_request(support_free_text_value: true)
        assert_status 200
        json_response = json_parse response_body
        expect(json_response[:data].size).to eq 1
        expect(json_response[:data].map { |d| d.dig(:attributes, :key) }).to eq [
          custom_field1.key
        ]
      end
    end
  end
end
