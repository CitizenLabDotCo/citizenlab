# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Idea Custom Field Options' do
  explanation 'Options for each custom field used in ideas and native surveys.'

  before { header 'Content-Type', 'application/json' }

  let(:custom_field) { create(:custom_field_select, resource: custom_form) }
  let(:custom_field_option) { create(:custom_field_option, custom_field: custom_field) }
  let(:id) { custom_field_option.id }

  get 'web_api/v1/custom_field_options/:id' do
    context 'when admin' do
      before { admin_header_token }

      context 'for a project custom_form' do
        let(:project) { create(:project) }
        let(:custom_form) { create(:custom_form, participation_context: project) }
        let(:project_id) { project.id }

        example_request 'Get one custom field by id' do
          assert_status 200
          expect(response_data[:type]).to eq 'custom_field_option'
          expect(response_data[:id]).to eq id
        end
      end

      context 'for a phase custom_form' do
        let(:phase) { create(:native_survey_phase) }
        let(:custom_form) { create(:custom_form, participation_context: phase) }
        let(:phase_id) { phase.id }

        before { admin_header_token }

        example_request 'Get one custom field by id' do
          assert_status 200
          expect(response_data[:type]).to eq 'custom_field_option'
          expect(response_data[:id]).to eq id
        end
      end
    end
  end
end
