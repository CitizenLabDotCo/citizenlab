# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Custom Forms' do
  before { header 'Content-Type', 'application/json' }

  context 'when admin' do
    before { admin_header_token }

    context 'phase level forms' do
      let(:context) { create(:native_survey_phase) }
      let!(:form) { create(:custom_form, participation_context: context) }
      let(:phase_id) { context.id }

      get 'web_api/v1/phases/:phase_id/custom_form' do
        example_request 'Return the custom form for a phase' do
          assert_status 200
          expect(response_data[:id]).to eq form.id
          expect(response_data[:type]).to eq 'custom_form'
          expect(response_data[:attributes].keys).to match_array %i[
            opened_at
            fields_last_updated_at
            print_start_multiloc
            print_end_multiloc
            print_personal_data_fields
          ]
        end
      end

      patch 'web_api/v1/phases/:phase_id/custom_form' do
        with_options scope: :custom_form do
          parameter :print_start_multiloc, 'Configurable text for the start of the printed PDF form', required: false
          parameter :print_end_multiloc, 'Configurable text for the end of the printed PDF form', required: false
          parameter :print_personal_data_fields, 'Whether the personal data section should be shown in the printed PDF form', required: false
        end

        let(:print_start_multiloc) { { 'en' => 'Start text' } }
        let(:print_end_multiloc) { { 'en' => 'End text' } }
        let(:print_personal_data_fields) { true }

        example 'Updates the print start and end text for a custom form & does not update fields_last_updated_at' do
          fields_last_updated_at_before = form.fields_last_updated_at
          do_request
          assert_status 200
          expect(response_data[:id]).to eq form.id
          expect(response_data[:type]).to eq 'custom_form'
          expect(response_data.dig(:attributes, :print_start_multiloc)).to eq({ en: 'Start text' })
          expect(response_data.dig(:attributes, :print_end_multiloc)).to eq({ en: 'End text' })
          expect(response_data.dig(:attributes, :print_personal_data_fields)).to be true
          expect(form.reload.fields_last_updated_at).to eq fields_last_updated_at_before
        end
      end
    end

    context 'project level forms' do
      let(:context) { create(:single_phase_ideation_project) }
      let!(:form) { create(:custom_form, :with_default_fields, participation_context: context) }
      let(:project_id) { context.id }

      get 'web_api/v1/projects/:project_id/custom_form' do
        example_request 'Return the custom form for a project' do
          assert_status 200
          expect(response_data[:id]).to eq form.id
          expect(response_data[:type]).to eq 'custom_form'
          expect(response_data[:attributes].keys).to match_array %i[
            opened_at
            fields_last_updated_at
            print_start_multiloc
            print_end_multiloc
            print_personal_data_fields
          ]
        end
      end

      patch 'web_api/v1/projects/:project_id/custom_form' do
        with_options scope: :custom_form do
          parameter :print_start_multiloc, 'Configurable text for the start of the printed PDF form', required: false
          parameter :print_end_multiloc, 'Configurable text for the end of the printed PDF form', required: false
          parameter :print_personal_data_fields, 'Whether the personal data section should be shown in the printed PDF form', required: false
        end

        let(:print_start_multiloc) { { 'en' => 'Start text' } }
        let(:print_end_multiloc) { { 'en' => 'End text' } }
        let(:print_personal_data_fields) { false }

        example 'Updates the print start and end text for a custom form & does not update fields_last_updated_at' do
          fields_last_updated_at_before = form.fields_last_updated_at
          do_request
          assert_status 200
          expect(response_data[:id]).to eq form.id
          expect(response_data[:type]).to eq 'custom_form'
          expect(response_data.dig(:attributes, :print_start_multiloc)).to eq({ en: 'Start text' })
          expect(response_data.dig(:attributes, :print_end_multiloc)).to eq({ en: 'End text' })
          expect(response_data.dig(:attributes, :print_personal_data_fields)).to be false
          expect(form.reload.fields_last_updated_at).to eq fields_last_updated_at_before
        end
      end
    end
  end

  context 'when normal user' do
    before { header_token_for create(:user) }

    context 'phase level forms' do
      let(:context) { create(:native_survey_phase, start_at: 1.month.ago, end_at: 1.month.from_now) }
      let!(:form) { create(:custom_form, participation_context: context) }
      let(:phase_id) { context.id }
      let(:_permission) { create(:permission, action: 'posting_idea', permission_scope: context) }

      get 'web_api/v1/phases/:phase_id/custom_form' do
        example_request 'Returns the custom form for a phase' do
          assert_status 200
        end
      end

      patch 'web_api/v1/phases/:phase_id/custom_form' do
        example_request 'ERROR: Unauthorized' do
          assert_status 401
        end
      end
    end

    context 'project level forms' do
      let(:context) { create(:single_phase_ideation_project) }
      let!(:form) { create(:custom_form, :with_default_fields, participation_context: context) }
      let(:project_id) { context.id }

      get 'web_api/v1/projects/:project_id/custom_form' do
        example_request 'Returns the custom form for a project' do
          assert_status 200
        end
      end

      patch 'web_api/v1/projects/:project_id/custom_form' do
        example_request 'ERROR: Unauthorized' do
          assert_status 401
        end
      end
    end
  end
end
