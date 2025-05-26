# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require_relative '../shared/errors_examples'

resource 'Ideas', :active_job_que_adapter do
  before do
    header 'Content-Type', 'application/json'
  end

  post 'web_api/v1/phases/:to_phase_id/inputs/copy' do
    with_options scope: :filters do
      parameter :phase, 'The ID of the phase'
    end

    let(:from_phase) { create(:phase) }
    let(:to_phase) { create(:phase) }

    let(:to_phase_id) { to_phase.id }
    let(:phase) { from_phase.id }
    let!(:ideas) { create_list(:idea, 3, phases: [from_phase]) }

    context 'when regular user' do
      before { header_token_for create(:user) }

      include_examples 'unauthorized'
    end

    context 'when admin' do
      before { admin_header_token }

      example_request 'Copy ideas into the target phase' do
        expect(status).to eq(200)

        expect(response_data).to match(
          id: be_a(String),
          type: 'job',
          attributes: {
            job_type: 'Ideas::CopyJob',
            progress: 0,
            total: 3,
            created_at: be_a(String),
            updated_at: be_a(String)
          }
        )
      end
    end
  end
end
