# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Job', :active_job_que_adapter, :admin_api do
  header 'Content-Type', 'application/json'
  header 'Authorization', ENV.fetch('ADMIN_API_TOKEN')

  get 'admin_api/jobs/:id' do
    let(:id) { job.job_id }

    context 'when the job is an instance of AdminApi::CopyProjectJob' do
      let(:job) { AdminApi::CopyProjectJob.perform_later('') }

      example_request 'Find a job by id' do
        expect(status).to eq 200
        expect(json_response_body).to match(
          id: job.job_id,
          class: 'AdminApi::CopyProjectJob',
          tenant: Tenant.current.host,
          last_error_message: nil,
          status: 'pending',
          scheduled_at: QueJob.by_job_id!(id).run_at.iso8601(3)
        )
      end
    end

    context 'when the job is not an instance of AdminApi::CopyProjectJob' do
      let(:job) { TestJob.perform_later }

      example 'unauthorized (403)', document: false do
        do_request
        expect(status).to eq 403
      end
    end
  end
end
