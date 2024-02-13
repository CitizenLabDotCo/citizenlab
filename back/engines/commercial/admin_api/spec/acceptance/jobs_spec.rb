# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Job', admin_api: true do
  header 'Content-Type', 'application/json'
  header 'Authorization', ENV.fetch('ADMIN_API_TOKEN')

  around do |example|
    initial_adapter = ActiveJob::Base.queue_adapter
    ActiveJob::Base.queue_adapter = :que
    example.run
    ActiveJob::Base.queue_adapter = initial_adapter
  end

  get 'admin_api/jobs/:id' do
    let(:job) { TestJob.perform_later }
    let(:id) { job.job_id }

    example_request 'Find a job by id' do
      expect(status).to eq 200
      expect(json_response_body).to match(
        id: job.job_id,
        class: 'TestJob',
        tenant: Tenant.current.host,
        last_error_message: nil,
        status: 'pending',
        scheduled_at: QueJob.find(id).run_at.iso8601(3)
      )
    end
  end
end
