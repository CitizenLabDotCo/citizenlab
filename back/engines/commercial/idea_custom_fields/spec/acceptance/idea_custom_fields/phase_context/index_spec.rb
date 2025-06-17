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

  context 'When there are 2 survey phases in same project' do
    get 'web_api/v1/admin/phases/:phase_id/custom_fields' do
      let(:phase_id) { current_phase.id }

      let(:past_phase) { create(:native_survey_phase, start_at: 2.weeks.ago, end_at: 1.week.ago) }
      let(:form) { create(:custom_form, participation_context: past_phase) }
      let!(:custom_field1) { create(:custom_field_text, resource: form, key: 'survey1_field') }

      let(:current_phase) { create(:native_survey_phase, start_at: 1.week.ago, end_at: 1.week.from_now) }

      let(:project) { create(:project, phases[past_phase]) }

      context 'when survey form not persisted' do
        shared_examples "default survey custom fields" do
          example_request 'List default survey custom fields' do
            assert_status 200
            expect(response_data.size).to eq 3

            keys = response_data.map { |d| d.dig(:attributes, :key) }

            expect(keys).to include('page1', 'form_end')
            expect(keys.any? { |key| key.include?('default_question') }).to be true
          end
        end

        context 'when admin' do
          before { admin_header_token }

          include_examples "default survey custom fields"
        end

        context 'when regular user' do
          before { header_token_for(user) }

          let(:user) { create(:user) }

          include_examples "default survey custom fields"
        end

        context 'when visitor' do
          include_examples "default survey custom fields"
        end
      end

      context 'when survey form persisted' do
        let(:form2) { create(:custom_form, participation_context: current_phase) }
        let!(:custom_field2) { create(:custom_field_text, resource: form2, key: 'survey2_field') }

        shared_examples "non-default survey custom fields" do
          example_request 'List all custom fields for a survey' do
            assert_status 200
            expect(response_data.size).to eq 1
            expect(response_data.map { |d| d.dig(:attributes, :key) }).to eq [
              custom_field2.key
            ]
          end
        end

        context 'when admin' do
          before { admin_header_token }

          include_examples "non-default survey custom fields"
        end

        context 'when regular user' do
          before { header_token_for(user) }

          let(:user) { create(:user) }

          include_examples "non-default survey custom fields"
        end

        context 'when visitor' do
          include_examples "non-default survey custom fields"
        end
      end
    end
  end
end
