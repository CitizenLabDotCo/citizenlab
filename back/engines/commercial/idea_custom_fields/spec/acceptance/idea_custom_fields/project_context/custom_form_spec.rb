# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Custom Form' do
  before { header 'Content-Type', 'application/json' }

  get 'web_api/v1/admin/projects/:project_id/custom_fields/custom_form' do
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
