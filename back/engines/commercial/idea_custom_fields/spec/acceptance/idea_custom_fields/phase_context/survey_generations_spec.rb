# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Survey generations' do
  explanation 'Generate the fields of a native survey with AI, in a background job.'
  before do
    header 'Content-Type', 'application/json'
    SettingsService.new.activate_feature!('ai_survey_generator')
  end

  post 'web_api/v1/phases/:phase_id/survey_generations' do
    with_options scope: :survey_generation do
      parameter :prompt, 'The instructions for the AI', required: false
      parameter :locale, 'The locale in which to write the survey', required: true
      parameter :file_ids, 'IDs of project files (PDF, Markdown or plain text) to base the survey on', required: false, type: :array
    end

    let(:project) { create(:project, :draft) }
    let(:phase) { create(:native_survey_phase, project: project) }
    let(:phase_id) { phase.id }
    let(:prompt) { 'A short survey about the redesign of the central park' }
    let(:locale) { 'en' }

    context 'when visitor' do
      example '[error] Unauthorized (401)', document: false do
        do_request
        assert_status 401
      end
    end

    context 'when admin' do
      before { header_token_for(current_user) }

      let(:current_user) { create(:admin) }

      example 'Start a background job that generates the survey', :active_job_que_adapter do
        expect { do_request }
          .to change { QueJob.by_job_class(IdeaCustomFields::SurveyGenerationJob).count }.by(1)

        assert_status 202
        expect(response_data).to include(
          type: 'job',
          attributes: hash_including(job_type: 'IdeaCustomFields::SurveyGenerationJob', completed_at: nil),
          relationships: hash_including(
            owner: { data: { id: current_user.id, type: 'user' } },
            context: { data: { id: phase_id, type: 'phase' } }
          )
        )
      end

      example 'Refuse to start a second generation while one is running', :active_job_que_adapter, document: false do
        do_request
        assert_status 202

        expect { do_request }
          .not_to change { QueJob.by_job_class(IdeaCustomFields::SurveyGenerationJob).count }

        assert_status 409
        expect(json_response_body.dig(:errors, :base, 0, :error)).to eq 'generation_in_progress'
      end

      context 'with project files', :active_job_que_adapter do
        let(:file) { create(:file, projects: [project], ai_processing_allowed: true) }
        let(:prompt) { nil }
        let(:file_ids) { [file.id] }

        example 'Generate the survey from a file', document: false do
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
        do_request(survey_generation: { prompt: '', locale: 'en' })

        assert_status 422
        expect(json_response_body.dig(:errors, :prompt, 0, :error)).to eq 'blank'
      end

      example '[error] Use a locale that is not on the platform', document: false do
        do_request(survey_generation: { prompt: prompt, locale: 'xx-XX' })

        assert_status 422
        expect(json_response_body.dig(:errors, :locale, 0, :error)).to eq 'inclusion'
      end

      example '[error] Generate the survey of a published project', document: false do
        project.admin_publication.update!(publication_status: 'published')

        do_request
        assert_status 401
      end

      example '[error] Generate a survey when the feature is disabled', document: false do
        SettingsService.new.deactivate_feature!('ai_survey_generator')

        do_request
        assert_status 401
        expect(json_response_body.dig(:errors, :base, 0, :error)).to eq 'ai_survey_generator_disabled'
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
