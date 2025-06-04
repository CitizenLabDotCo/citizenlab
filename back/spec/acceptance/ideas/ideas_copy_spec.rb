# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require_relative '../shared/errors_examples'

resource 'Ideas' do
  before do
    header 'Content-Type', 'application/json'
  end

  post 'web_api/v1/phases/:to_phase_id/inputs/copy' do
    parameter :dry_run, <<~DESC.squish, type: :boolean, required: false, default: false
      If true, returns the number of ideas that would be copied without executing the job
      (default: false).
    DESC

    parameter :allow_duplicates, <<~DESC.squish, type: :boolean, required: false, default: false
      If true, allows copying ideas that have already been copied to the target phase.
      If false, skips ideas that have already been copied to the target phase.
      (default: false).
    DESC

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
      before { header_token_for(current_user) }

      let(:current_user) { create(:admin) }

      example 'Copy ideas into the target phase', :active_job_que_adapter do
        expect { do_request }.to change(QueJob, :count).by(1)

        expect(status).to eq(200)

        expect(response_data).to include(
          id: be_a(String),
          type: 'job',
          attributes: {
            job_type: 'Ideas::CopyJob',
            progress: 0,
            error_count: 0,
            total: 3,
            completed_at: nil,
            created_at: be_a(String),
            updated_at: be_a(String)
          },
          relationships: {
            owner: { data: { id: current_user.id, type: 'user' } },
            project: { data: { id: to_phase.project_id, type: 'project' } },
            context: { data: { id: to_phase_id, type: 'phase' } }
          }
        )
      end

      example 'Copy ideas into the target phase (dry run)' do
        expect { do_request(dry_run: 'true') }.not_to enqueue_job(Ideas::CopyJob)

        expect(status).to eq(200)

        expect(response_data).to include(
          id: be_a(String),
          type: 'job',
          attributes: {
            job_type: 'Ideas::CopyJob',
            progress: 0,
            error_count: 0,
            total: 3,
            completed_at: nil,
            created_at: nil,
            updated_at: nil
          },
          relationships: {
            owner: { data: { id: current_user.id, type: 'user' } },
            project: { data: { id: to_phase.project_id, type: 'project' } },
            context: { data: { id: to_phase_id, type: 'phase' } }
          }
        )
      end

      example 'Copy ideas into the target phase without duplicates', :active_job_que_adapter do
        # Create the status used for idea copies.
        create(:idea_status, code: 'proposed', participation_method: 'ideation')
        Ideas::CopyService.new.copy(ideas, to_phase, current_user)
        create(:idea, phases: [from_phase], slug: SecureRandom.uuid)

        do_request
        assert_status 200
        expect(response_data[:attributes][:total]).to eq(1)
      end
    end
  end
end
