# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Project generations' do
  explanation 'Draft a whole project (phases, page content, survey) with AI, in a background job.'
  before do
    header 'Content-Type', 'application/json'
    SettingsService.new.activate_feature!('ai_project_generator')
  end

  post 'web_api/v1/projects/:project_id/project_generations' do
    with_options scope: :project_generation do
      parameter :prompt, 'The manager brief for the AI', required: false
      parameter :locale, 'The locale in which to write the project', required: true
      parameter :file_ids, 'IDs of project files (PDF, Markdown or plain text) to base the project on', required: false, type: :array
      parameter :levers, 'The four lever indices (influence, how_fixed, reach, format, audience)', required: false, type: :object
    end

    let(:project) { create(:project, :draft) }
    let(:project_id) { project.id }
    let(:prompt) { 'A project to redesign the central park' }
    let(:locale) { 'en' }
    let(:levers) { { influence: 1, how_fixed: 0, reach: 2, format: 2, audience: 1 } }

    context 'when visitor' do
      example '[error] Unauthorized (401)', document: false do
        do_request
        assert_status 401
      end
    end

    context 'when admin' do
      before { header_token_for(current_user) }

      let(:current_user) { create(:admin) }

      example 'Start a background job that generates the project', :active_job_que_adapter do
        expect { do_request }
          .to change { QueJob.by_job_class(ProjectGeneration::ProjectGenerationJob).count }.by(1)

        assert_status 202
        expect(response_data).to include(
          type: 'job',
          attributes: hash_including(job_type: 'ProjectGeneration::ProjectGenerationJob', completed_at: nil),
          relationships: hash_including(
            owner: { data: { id: current_user.id, type: 'user' } },
            context: { data: { id: project_id, type: 'project' } }
          )
        )
      end

      example 'Refuse to start a second generation while one is running', :active_job_que_adapter, document: false do
        do_request
        assert_status 202

        expect { do_request }
          .not_to change { QueJob.by_job_class(ProjectGeneration::ProjectGenerationJob).count }

        assert_status 409
        expect(json_response_body.dig(:errors, :base, 0, :error)).to eq 'generation_in_progress'
      end

      context 'with project files', :active_job_que_adapter do
        let(:file) { create(:file, projects: [project], ai_processing_allowed: true) }
        let(:prompt) { nil }
        let(:file_ids) { [file.id] }

        example 'Generate the project from a file', document: false do
          do_request
          assert_status 202
        end

        example '[error] Use a file that is not allowed to be processed by AI', document: false do
          file.update!(ai_processing_allowed: false)

          do_request
          assert_status 422
          expect(json_response_body.dig(:errors, :file_ids, 0, :error)).to eq 'ai_processing_not_allowed'
        end

        example '[error] Use a file of another project', document: false do
          file.files_projects.update_all(project_id: create(:project).id)

          do_request
          assert_status 422
          expect(json_response_body.dig(:errors, :file_ids, 0, :error)).to eq 'not_found'
        end

        example '[error] Use a file of an unsupported type', document: false do
          file.update!(name: 'slides.pptx')

          do_request
          assert_status 422
          expect(json_response_body.dig(:errors, :file_ids, 0, :error)).to eq 'unsupported_file_type'
        end
      end

      example '[error] Send neither a prompt nor files', document: false do
        do_request(project_generation: { prompt: '', locale: 'en' })

        assert_status 422
        expect(json_response_body.dig(:errors, :prompt, 0, :error)).to eq 'blank'
      end

      example '[error] Use a locale that is not on the platform', document: false do
        do_request(project_generation: { prompt: prompt, locale: 'xx-XX' })

        assert_status 422
        expect(json_response_body.dig(:errors, :locale, 0, :error)).to eq 'inclusion'
      end

      example '[error] Generate a published project', document: false do
        project.admin_publication.update!(publication_status: 'published')

        do_request
        assert_status 401
      end

      example '[error] Generate when the feature is disabled', document: false do
        SettingsService.new.deactivate_feature!('ai_project_generator')

        do_request
        assert_status 401
        expect(json_response_body.dig(:errors, :base, 0, :error)).to eq 'ai_project_generator_disabled'
      end
    end

    context 'when moderator of another project' do
      before { header_token_for(create(:project_moderator, projects: [create(:project)])) }

      example '[error] Unauthorized (401)', document: false do
        do_request
        assert_status 401
      end
    end
  end
end
