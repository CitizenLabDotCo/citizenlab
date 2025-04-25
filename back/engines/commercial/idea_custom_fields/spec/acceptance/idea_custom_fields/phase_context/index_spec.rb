# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Idea Custom Fields' do
  explanation 'Fields in idea forms which are customized by the city, scoped on the project level.'

  before { header 'Content-Type', 'application/json' }

  get 'web_api/v1/admin/phases/:phase_id/custom_fields' do
    parameter :support_free_text_value, 'Only return custom fields that have a freely written textual answer', type: :boolean, required: false
    parameter :copy, 'Return non-persisted copies of all custom fields with new IDs', type: :boolean, required: false
    parameter :input_types, 'Filter custom fields by input types', type: :array, items: { type: :string }, required: false

    let(:context) { create(:native_survey_phase) }
    let(:phase_id) { context.id }
    let(:form) { create(:custom_form, participation_context: context) }
    let!(:custom_field1) { create(:custom_field_text, resource: form, key: 'extra_field1') }
    let!(:custom_field2) { create(:custom_field_number, resource: form, key: 'extra_field2') }

    context 'when admin' do
      before { admin_header_token }

      example_request 'List all allowed custom fields for a phase' do
        assert_status 200
        expect(response_data.size).to eq 2
        expect(response_data.map { |d| d.dig(:attributes, :key) }).to eq [
          custom_field1.key,
          custom_field2.key
        ]
      end

      example 'List all allowed custom fields for a phase with a textual answer', document: false do
        do_request(support_free_text_value: true)
        assert_status 200
        expect(response_data.size).to eq 1
        expect(response_data.map { |d| d.dig(:attributes, :key) }).to eq [
          custom_field1.key
        ]
      end

      example 'List all custom fields for a phase reset for copying', document: false do
        do_request(copy: true)
        assert_status 200

        expect(response_data.size).to eq 2
        expect(response_data[0][:id]).not_to eq custom_field1.id
        expect(response_data[1][:id]).not_to eq custom_field2.id
      end

      example 'List all relevant custom fields for a phase with a filter on input_types' do
        do_request(input_types: ['number'])
        assert_status 200
        expect(response_data.size).to eq 1
        expect(response_data.map { |d| d.dig(:attributes, :key) }).to eq [
          custom_field2.key
        ]
      end
    end
  end
end
