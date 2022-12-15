# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Ideas' do
  explanation 'Inputs posted by residents: native survey responses.'

  let(:user) { create(:user) }

  before do
    header 'Content-Type', 'application/json'
    token = Knock::AuthToken.new(payload: user.to_token_payload).token
    header 'Authorization', "Bearer #{token}"
    IdeaStatus.create_defaults
  end

  get 'web_api/v1/ideas/:id' do
    let(:project) { create :project_with_active_native_survey_phase }
    let(:creation_phase) { project.phases.first }
    let!(:input) do
      create(
        :idea,
        author: user,
        project: project,
        creation_phase: creation_phase,
        phases: [creation_phase]
      )
    end
    let(:id) { input.id }

    example_request '[error] Try to get one input by id' do
      assert_status 401
      json_response = json_parse(response_body)
      expect(json_response).to eq({ errors: { base: [{ error: 'Unauthorized!' }] } })
    end
  end

  get 'web_api/v1/ideas/by_slug/:slug' do
    let(:project) { create :project_with_active_native_survey_phase }
    let(:creation_phase) { project.phases.first }
    let!(:input) do
      create(
        :idea,
        author: user,
        project: project,
        creation_phase: creation_phase,
        phases: [creation_phase]
      )
    end
    let(:slug) { input.slug }

    example_request '[error] Try to get one input by slug' do
      assert_status 401
      json_response = json_parse(response_body)
      expect(json_response).to eq({ errors: { base: [{ error: 'Unauthorized!' }] } })
    end
  end

  post 'web_api/v1/ideas' do
    with_options scope: :idea do
      parameter :project_id, 'The identifier of the project that hosts the input', required: true
      parameter :phase_ids, 'The identifiers of the phases that host the input. None is allowed for normal users.', required: false
      parameter :custom_field_name1, 'A value for one custom field'
    end
    ValidationErrorHelper.new.error_fields(self, Idea)

    context 'when phase_ids are not given', skip: !CitizenLab.ee? do
      let(:phase_ids) { [] }
      let(:project_id) { project.id }

      context 'with an active participation context' do
        let!(:custom_field) do
          create(
            :custom_field,
            resource: custom_form,
            key: 'custom_field_name1',
            enabled: true,
            title_multiloc: { 'en' => 'What is your favourite pet?' },
            description_multiloc: { 'en' => 'Enter one pet.' }
          )
        end
        let(:custom_field_name1) { 'Cat' }

        describe 'in a continuous native survey project' do
          let(:project) { create :continuous_native_survey_project }
          let(:custom_form) { create(:custom_form, participation_context: project) }

          example_request 'Create an input' do
            assert_status 201
            json_response = json_parse response_body
            expect(json_response.dig(:data, :relationships, :project, :data, :id)).to eq project_id
            inputs = project.reload.ideas
            expect(inputs.size).to eq 1
            input = inputs.first
            expect(input.phase_ids).to eq []
            expect(input.custom_field_values).to eq({ 'custom_field_name1' => 'Cat' })
            expect(input.creation_phase).to be_nil
          end
        end

        describe 'with an active native survey phase' do
          let(:project) { create :project_with_active_native_survey_phase }
          let(:active_phase) { project.phases.first }
          let(:custom_form) { create(:custom_form, participation_context: active_phase) }

          example_request 'Create an input' do
            assert_status 201
            json_response = json_parse response_body
            expect(json_response.dig(:data, :relationships, :project, :data, :id)).to eq project_id
            inputs = project.reload.ideas
            expect(inputs.size).to eq 1
            input = inputs.first
            expect(inputs.first.phase_ids).to eq [active_phase.id]
            expect(input.custom_field_values).to eq({ 'custom_field_name1' => 'Cat' })
            expect(input.creation_phase_id).to eq active_phase.id
          end
        end
      end

      context 'without active participation context' do
        let(:project) { create :project_with_future_native_survey_phase }

        example_request '[error] Trying to create an input' do
          assert_status 400
          expect(json_parse(response_body)).to be_nil
        end
      end
    end

    context 'when phase_ids are given' do
      let(:phase_ids) { ['1234'] }
      let(:project_id) { project.id }

      describe 'in a continuous native survey project' do
        let(:project) { create :continuous_native_survey_project }

        example_request '[error] Trying to create an input' do
          assert_status 400
          expect(json_parse(response_body)).to be_nil
        end
      end

      describe 'in an active native survey phase' do
        let(:project) { create :project_with_active_native_survey_phase }

        example_request '[error] Trying to create an input' do
          assert_status 400
          expect(json_parse(response_body)).to be_nil
        end
      end

      context 'without active participation context' do
        let(:project) { create :project_with_future_native_survey_phase }

        example_request '[error] Trying to create an input' do
          assert_status 400
          expect(json_parse(response_body)).to be_nil
        end
      end
    end
  end

  patch 'web_api/v1/ideas/:id' do
    with_options scope: :idea do
      parameter :project_id, 'The identifier of the project that hosts the input', required: true
      parameter :custom_field_name1, 'A value for one custom field'
    end
    ValidationErrorHelper.new.error_fields(self, Idea)
    let(:project) { create :project_with_active_native_survey_phase }
    let(:active_phase) { project.phases.first }
    let(:custom_form) { create(:custom_form, participation_context: active_phase) }
    let(:creation_phase) { active_phase }
    let(:creation_phase) { nil }
    let!(:input) do
      create(
        :idea,
        author: user,
        project: project,
        custom_field_values: {
          custom_field_name1: 'Cat'
        },
        creation_phase: creation_phase,
        phases: [creation_phase].compact
      )
    end
    let(:id) { input.id }
    let(:project_id) { project.id }
    let(:custom_field_name1) { 'Dog' }

    context 'native survey' do
      context 'with active participation context' do
        let!(:custom_field) do
          create(
            :custom_field,
            resource: custom_form,
            key: 'custom_field_name1',
            enabled: true,
            title_multiloc: { 'en' => 'What is your favourite pet?' },
            description_multiloc: { 'en' => 'Enter one pet.' }
          )
        end

        describe 'in a continuous native survey project' do
          let(:project) { create :continuous_native_survey_project }
          let(:custom_form) { create(:custom_form, participation_context: project) }

          example_request '[error] Trying to update an input' do
            assert_status 401
            json_response = json_parse(response_body)
            expect(json_response).to eq({ errors: { base: [{ error: 'Unauthorized!' }] } })
          end
        end

        describe 'in a native survey phase' do
          let(:project) { create :project_with_active_native_survey_phase }
          let(:active_phase) { project.phases.first }
          let(:custom_form) { create(:custom_form, participation_context: active_phase) }
          let(:creation_phase) { active_phase }

          example_request '[error] Trying to update an input' do
            assert_status 401
            json_response = json_parse(response_body)
            expect(json_response).to eq({ errors: { base: [{ error: 'Unauthorized!' }] } })
          end
        end
      end

      context 'without active participation context' do
        describe 'before all phases' do
          let(:project) { create :project_with_future_phases }

          example_request '[error] Trying to update an input' do
            assert_status 401
            json_response = json_parse(response_body)
            expect(json_response).to eq({ errors: { base: [{ error: 'Unauthorized!' }] } })
          end
        end

        describe 'after all phases' do
          let(:project) { create :project_with_past_phases }

          example_request '[error] Trying to update an input' do
            assert_status 401
            json_response = json_parse(response_body)
            expect(json_response).to eq({ errors: { base: [{ error: 'Unauthorized!' }] } })
          end
        end
      end
    end
  end
end
