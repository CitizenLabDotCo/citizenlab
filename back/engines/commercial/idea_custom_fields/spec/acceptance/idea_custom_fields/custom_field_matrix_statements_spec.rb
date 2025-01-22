require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Idea Custom Field Matrix Statements' do
  explanation 'Options for each custom field used in ideas and native surveys.'

  before { header 'Content-Type', 'application/json' }

  let(:custom_field) { create(:custom_field_matrix_linear_scale, resource: custom_form) }
  let(:custom_field_id) { custom_field.id }
  let(:statement) { custom_field.matrix_statements.first }
  let(:id) { statement.id }

  get 'web_api/v1/admin/projects/:project_id/custom_fields/:custom_field_id/custom_field_matrix_statements/:id' do
    let(:project) { create(:project) }
    let(:custom_form) { create(:custom_form, participation_context: project) }
    let(:project_id) { project.id }

    context 'when admin' do
      before { admin_header_token }

      example_request 'Get one matrix statement by id' do
        assert_status 200
        expect(response_data[:type]).to eq 'custom_field_matrix_statement'
        expect(response_data[:id]).to eq id
        expect(response_data[:attributes][:title_multiloc].stringify_keys).to eq statement.title_multiloc
      end
    end
  end

  get 'web_api/v1/admin/phases/:phase_id/custom_fields/:custom_field_id/custom_field_matrix_statements/:id' do
    let(:phase) { create(:native_survey_phase) }
    let(:custom_form) { create(:custom_form, participation_context: phase) }
    let(:phase_id) { phase.id }

    context 'when admin' do
      before { admin_header_token }

      example_request 'Get one matrix statement by id' do
        assert_status 200
        expect(response_data[:type]).to eq 'custom_field_matrix_statement'
        expect(response_data[:id]).to eq id
        expect(response_data[:attributes][:title_multiloc].stringify_keys).to eq statement.title_multiloc
      end
    end
  end
end
