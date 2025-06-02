# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Jobs' do
  explanation 'Jobs are background processes that can be tracked for progress.'

  header 'Content-Type', 'application/json'

  get 'web_api/v1/jobs' do
    parameter :project_id, 'Filter by project id', required: false
    parameter :owner_id, 'Filter by owner id', required: false
    parameter :context_type, 'Filter by context type', required: false
    parameter :context_id, 'Filter by context id', required: false

    let!(:jobs) { create_list(:jobs_tracker, 3) }

    context 'when admin' do
      before { admin_header_token }

      example_request 'List all jobs' do
        expect(status).to eq(200)
        expect(response_data.count).to eq(3)
      end

      describe 'filter by project' do
        let!(:job) { create(:jobs_tracker, :with_phase_context) }
        let(:project_id) { job.project_id }

        example_request 'Filter by project' do
          expect(status).to eq(200)
          expect(response_ids).to eq [job.id]
        end
      end

      describe 'filter by owner' do
        let!(:filtered_jobs) { create_pair(:jobs_tracker, owner: owner) }
        let(:owner) { create(:admin) }
        let(:owner_id) { owner.id }

        before { create(:jobs_tracker, :with_owner) }

        example_request 'Filter by owner' do
          expect(status).to eq(200)
          expect(response_ids).to match_array(filtered_jobs.map(&:id))
        end
      end

      describe 'filter by context' do
        let!(:filtered_jobs) { create_pair(:jobs_tracker, context: context) }
        let(:context) { create(:phase) }
        let(:context_type) { context.class.name }
        let(:context_id) { context.id }

        before { create(:jobs_tracker, :with_phase_context) }

        example_request 'Filter by context' do
          expect(status).to eq(200)
          expect(response_ids).to match_array(filtered_jobs.map(&:id))
        end
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
