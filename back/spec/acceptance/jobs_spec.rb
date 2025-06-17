# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require_relative 'shared/errors_examples'

resource 'Jobs' do
  explanation 'Jobs are background processes that can be tracked for progress.'
  header 'Content-Type', 'application/json'

  get 'web_api/v1/jobs' do
    parameter :project_id, 'Filter by project id', required: false
    parameter :owner_id, 'Filter by owner id', required: false
    parameter :context_type, 'Filter by context type', required: false
    parameter :context_id, 'Filter by context id', required: false
    parameter :completed, 'Filter by completion status', required: false

    let_it_be(:jobs) { create_list(:jobs_tracker, 3) }

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

      describe 'filter by completion status' do
        let_it_be(:completed_job) { create(:jobs_tracker, completed_at: 1.hour.ago) }

        describe 'completed=true' do
          let(:completed) { true }

          example_request 'Filter by completed jobs' do
            expect(status).to eq(200)
            expect(response_ids).to contain_exactly(completed_job.id)
          end
        end

        describe 'completed=false' do
          let(:completed) { false }

          example 'Filter by incomplete jobs', document: false do
            do_request
            expect(status).to eq(200)
            expect(response_ids).to match_array(jobs.map(&:id))
          end
        end
      end
    end
  end

  get 'web_api/v1/jobs/:id' do
    let(:id) { job.id }
    let(:job) do
      create(
        :jobs_tracker, :with_phase_context, :with_owner,
        progress: 75, total: 150
      )
    end

    context 'when admin' do
      before { admin_header_token }

      example_request 'Get one job by id' do
        expect(status).to eq(200)
        expect(response_data).to include(
          id: job.id,
          type: 'job',
          attributes: {
            job_type: job.root_job_type,
            progress: 75,
            error_count: 0,
            total: 150,
            completed_at: nil,
            created_at: job.created_at.iso8601(3),
            updated_at: job.updated_at.iso8601(3)
          },
          relationships: {
            owner: { data: { id: job.owner_id, type: 'user' } },
            context: { data: { id: job.context_id, type: 'phase' } },
            project: { data: { id: job.project_id, type: 'project' } }
          }
        )
      end

      context 'when job does not exist' do
        let(:id) { 'non-existent-id' }

        include_examples 'not_found'
      end
    end
  end
end
