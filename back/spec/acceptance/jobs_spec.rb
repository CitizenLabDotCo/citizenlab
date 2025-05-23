# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Jobs' do
  explanation 'Jobs are background processes that can be tracked for progress.'

  header 'Content-Type', 'application/json'

  get 'web_api/v1/jobs' do
    let!(:jobs) { create_list(:jobs_tracker, 3) }
    context 'when admin' do
      before { admin_header_token }

      example_request 'List all jobs' do
        expect(status).to eq(200)
        expect(response_data.count).to eq(3)
      end
    end
  end

  get 'web_api/v1/jobs/:id' do
    let(:job) { create(:jobs_tracker, progress: 75, total: 150) }
    let(:id) { job.id }

    example_request 'Get one job by id' do
      expect(status).to eq(200)
      expect(response_data).to eq(
        id: job.id,
        type: 'job',
        attributes: {
          job_type: job.root_job_type,
          progress: 75,
          total: 150,
          created_at: job.created_at.iso8601(3),
          updated_at: job.updated_at.iso8601(3)
        }
      )
    end

    xcontext 'when job is completed' do
      let(:job) { create(:jobs_tracker, progress: 100, total: 100) }

      example_request 'Get a completed job' do
        expect(status).to eq(200)
        json_response = json_parse(response_body)

        expect(json_response[:data][:attributes][:percentage]).to eq 100
        expect(json_response[:data][:attributes][:status]).to eq 'completed'
      end
    end

    xcontext 'when job does not exist' do
      let(:id) { 'non-existent-id' }

      example_request 'Get a non-existent job' do
        expect(status).to eq(404)
        json_response = json_parse(response_body)
        expect(json_response[:errors][0][:status]).to eq 404
        expect(json_response[:errors][0][:title]).to eq 'Not Found'
      end
    end
  end
end
