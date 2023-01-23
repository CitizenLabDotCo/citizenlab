# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Ideas' do
  explanation 'Inputs posted by admins: native survey responses.'

  let(:user) { create(:admin) }

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
      parameter :phase_ids, 'The identifiers of the phases that host the input. Only 1 allowed, and only for roles that are allowed to moderate projects.', required: false
      parameter :custom_field_name1, 'A value for one custom field'
    end
    ValidationErrorHelper.new.error_fields(self, Idea)
  end

  patch 'web_api/v1/ideas/:id' do
    with_options scope: :idea do
      parameter :project_id, 'The identifier of the project that hosts the input', required: true
      parameter :custom_field_name1, 'A value for one custom field'
    end
    ValidationErrorHelper.new.error_fields(self, Idea)
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

    context 'in a continuous native survey project' do
      let(:project) { create :continuous_native_survey_project }
      let(:custom_form) { create(:custom_form, participation_context: project) }

      example_request '[error] Trying to update an input' do
        assert_status 401
        json_response = json_parse(response_body)
        expect(json_response).to eq({ errors: { base: [{ error: 'Unauthorized!' }] } })
      end
    end

    context 'in a native survey phase' do
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

    context 'without active participation context' do
      let(:project) { create :project_with_past_and_future_native_survey_phase }
      let(:past_phase) { project.phases.first }
      let(:custom_form) { create(:custom_form, participation_context: past_phase) }
      let(:creation_phase) { past_phase }

      example_request '[error] Trying to update an input' do
        assert_status 401
        json_response = json_parse(response_body)
        expect(json_response).to eq({ errors: { base: [{ error: 'Unauthorized!' }] } })
      end
    end
  end
end
