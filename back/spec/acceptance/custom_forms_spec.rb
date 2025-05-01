# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Custom Forms' do
  before { header 'Content-Type', 'application/json' }

  context 'phase level forms' do
    get 'web_api/v1/phases/:phase_id/custom_form' do
      let(:context) { create(:native_survey_phase) }
      let!(:form) { create(:custom_form, participation_context: context) }
      let(:phase_id) { context.id }

      context 'when admin' do
        before { admin_header_token }

        example_request 'Return the custom form for a phase' do
          assert_status 200
          expect(response_data[:id]).to eq form.id
          expect(response_data[:type]).to eq 'custom_form'
          expect(response_data[:attributes].keys).to match_array %i[updated_at opened_at]
        end
      end
    end
  end

  context 'project level forms' do
    get 'web_api/v1/projects/:project_id/custom_form' do
      let(:context) { create(:single_phase_ideation_project) }
      let!(:form) { create(:custom_form, :with_default_fields, participation_context: context) }
      let(:project_id) { context.id }

      context 'when admin' do
        before { admin_header_token }

        example_request 'Return the custom form for a project' do
          assert_status 200
          expect(response_data[:id]).to eq form.id
          expect(response_data[:type]).to eq 'custom_form'
          expect(response_data[:attributes].keys).to match_array %i[updated_at opened_at]
        end
      end
    end
  end
end
