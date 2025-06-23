# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Ideas' do
  explanation 'Inputs posted by admins: native survey responses.'

  let(:user) { create(:admin) }

  before do
    header 'Content-Type', 'application/json'
    header_token_for user
    create(:idea_status_proposed)
  end

  get 'web_api/v1/ideas/:id' do
    let(:project) { create(:project_with_active_native_survey_phase) }
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

    example_request 'Get one input by id' do
      assert_status 200
      expect(response_data[:id]).to eq input.id
    end
  end

  get 'web_api/v1/ideas/by_slug/:slug' do
    let(:project) { create(:project_with_active_native_survey_phase) }
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

    example_request 'Get one input by slug' do
      assert_status 200
      expect(response_data[:id]).to eq input.id
    end
  end

  post 'web_api/v1/ideas' do
    with_options scope: :idea do
      parameter :project_id, 'The identifier of the project that hosts the input', required: true
      parameter :phase_ids, 'The identifiers of the phases that host the input. Only 1 allowed, and only for roles that are allowed to moderate projects.', required: false
      parameter :custom_field_name1, 'A value for one custom field'
    end
    ValidationErrorHelper.new.error_fields(self, Idea)

    context 'when phase_ids are not given' do
      let(:phase_ids) { [] }
      let(:project_id) { project.id }

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

      context 'in an active native survey phase' do
        let(:project) { create(:project_with_active_native_survey_phase) }
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

      context 'without active participation context' do
        let(:project) { create(:project_with_future_native_survey_phase) }
        let(:future_phase) { project.phases.first }
        let(:custom_form) { create(:custom_form, participation_context: future_phase) }

        example_request '[error] Trying to create an input' do
          assert_status 400
          expect(json_parse(response_body)).to be_nil
        end
      end
    end

    context 'when phase_ids are given' do
      let(:project_id) { project.id }
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

      context 'with an active native survey phase' do
        let(:project) { create(:project_with_active_and_future_native_survey_phase) }
        let(:active_phase) { project.phases.first }
        let(:future_phase) { project.phases.last }
        let(:phase_ids) { [future_phase.id] }
        let(:active_custom_form) { create(:custom_form, participation_context: active_phase) }
        let(:custom_form) { create(:custom_form, participation_context: future_phase) }

        example_request 'Create an input' do
          assert_status 201
          json_response = json_parse response_body
          expect(json_response.dig(:data, :relationships, :project, :data, :id)).to eq project_id
          inputs = project.reload.ideas
          expect(inputs.size).to eq 1
          input = inputs.first
          expect(inputs.first.phase_ids).to eq [future_phase.id]
          expect(input.custom_field_values).to eq({ 'custom_field_name1' => 'Cat' })
          expect(input.creation_phase_id).to eq future_phase.id
        end
      end

      context 'without active participation context' do
        let(:project) { create(:project_with_future_native_survey_phase) }
        let(:future_phase) { project.phases.first }
        let(:phase_ids) { [future_phase.id] }
        let(:custom_form) { create(:custom_form, participation_context: future_phase) }

        example_request 'Create an input' do
          assert_status 201
          json_response = json_parse response_body
          expect(json_response.dig(:data, :relationships, :project, :data, :id)).to eq project_id
          inputs = project.reload.ideas
          expect(inputs.size).to eq 1
          input = inputs.first
          expect(inputs.first.phase_ids).to eq [future_phase.id]
          expect(input.custom_field_values).to eq({ 'custom_field_name1' => 'Cat' })
          expect(input.creation_phase_id).to eq future_phase.id
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

    context 'in a native survey phase' do
      let(:project) { create(:project_with_active_native_survey_phase) }
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
      let(:project) { create(:project_with_past_and_future_native_survey_phase) }
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
