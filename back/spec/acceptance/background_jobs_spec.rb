# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'BackgroundJob', :active_job_que_adapter, :admin_api do
  header 'Content-Type', 'application/json'

  get 'web_api/v1/background_jobs' do
    parameter :ids, 'Array of job ids', required: true

    let(:ids) { jobs.map(&:job_id) }

    let(:jobs) { Array.new(2) { TestJob.perform_later } }

    context 'when admin' do
      before do
        admin_header_token
      end

      example_request 'Find jobs by ids' do
        expect(status).to eq 200
        expect(json_response_body).to match({
          data: jobs.map do |job|
            {
              attributes: {
                status: 'pending',
                active: true,
                job_id: job.job_id
              },
              id: instance_of(String),
              type: 'background_job'
            }
          end
        })
      end
    end

    context 'when user' do
      before do
        resident_header_token
      end

      example_request '[error] Find jobs by ids' do
        expect(status).to eq 401
      end
    end
  end
end
