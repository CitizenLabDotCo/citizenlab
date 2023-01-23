# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Phases' do
  explanation 'Timeline projects consist of multiple phases through which ideas can transit.'

  let(:json_response) { json_parse(response_body) }

  before do
    header 'Content-Type', 'application/json'
    create(:idea_status_proposed)
    @project = create(:project)
    @phases = create_list(:phase_sequence, 2, project: @project)
  end

  get 'web_api/v1/projects/:project_id/phases' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of phases per page'
    end
    let(:project_id) { @project.id }

    example_request 'List all phases of a project' do
      assert_status 200
      expect(json_response[:data].size).to eq 2
    end
  end

  get 'web_api/v1/phases/:id' do
    let(:id) { @phases.first.id }

    example 'Get one phase by id' do
      create_list(:idea, 2, project: @project, phases: @phases)
      do_request
      assert_status 200

      expect(json_response.dig(:data, :id)).to eq @phases.first.id
      expect(json_response.dig(:data, :type)).to eq 'phase'
      expect(json_response.dig(:data, :attributes)).to include(
        upvoting_method: 'unlimited',
        ideas_count: 2
      )

      expect(json_response.dig(:data, :relationships, :project)).to match({
        data: { id: @phases.first.project_id, type: 'project' }
      })
    end
  end

  delete 'web_api/v1/phases/:id/inputs' do
    let(:project) { create(:project_with_active_native_survey_phase) }
    let(:active_phase) { project.phases.first }
    let(:id) { active_phase.id }

    example '[error] Delete all inputs of a phase' do
      create :idea, project: project, phases: [active_phase]

      do_request
      assert_status 401
    end
  end

  context 'when authenticated as admin' do
    before do
      @user = create(:admin)
      token = Knock::AuthToken.new(payload: @user.to_token_payload).token
      header 'Authorization', "Bearer #{token}"
    end

    post 'web_api/v1/projects/:project_id/phases' do
      with_options scope: :phase do
        parameter :title_multiloc, 'The title of the phase in nultiple locales', required: true
        parameter :description_multiloc, 'The description of the phase in multiple languages. Supports basic HTML.', required: false
        parameter :participation_method, "The participation method of the project, either #{ParticipationContext::PARTICIPATION_METHODS.join(',')}. Defaults to ideation.", required: false
        parameter :posting_enabled, 'Can citizens post ideas in this phase? Defaults to true', required: false
        parameter :posting_method, "How does posting work? Either #{ParticipationContext::POSTING_METHODS.join(',')}. Defaults to unlimited for ideation, and limited to one for native surveys.", required: false
        parameter :posting_limited_max, 'Number of posts a citizen can perform in this phase. Defaults to 1', required: false
        parameter :commenting_enabled, 'Can citizens post comment in this phase? Defaults to true', required: false
        parameter :voting_enabled, 'Can citizens vote in this phase? Defaults to true', required: false
        parameter :upvoting_method, "How does upvoting work? Either #{ParticipationContext::VOTING_METHODS.join(',')}. Defaults to unlimited", required: false
        parameter :upvoting_limited_max, 'Number of upvotes a citizen can perform in this phase, only if the upvoting_method is limited. Defaults to 10', required: false
        parameter :downvoting_enabled, 'Can citizens downvote in this phase? Defaults to true', required: false
        parameter :downvoting_method, "How does downvoting work? Either #{ParticipationContext::VOTING_METHODS.join(',')}. Defaults to unlimited", required: false
        parameter :downvoting_limited_max, 'Number of downvotes a citizen can perform in this phase, only if the downvoting_method is limited. Defaults to 10', required: false
        parameter :presentation_mode, "Describes the presentation of the project's items (i.e. ideas), either #{ParticipationContext::PRESENTATION_MODES.join(',')}.", required: false
        parameter :survey_embed_url, 'The identifier for the survey from the external API, if participation_method is set to survey', required: false
        parameter :survey_service, "The name of the service of the survey. Either #{Surveys::SurveyParticipationContext::SURVEY_SERVICES.join(',')}", required: false
        parameter :min_budget, 'The minimum budget amount. Participatory budget should be greater or equal to input.', required: false
        parameter :max_budget, 'The maximal budget amount each citizen can spend during participatory budgeting.', required: false
        parameter :start_at, 'The start date of the phase', required: true
        parameter :end_at, 'The end date of the phase', required: true
        parameter :poll_anonymous, "Are users associated with their answer? Defaults to false. Only applies if participation_method is 'poll'", required: false
        parameter :ideas_order, 'The default order of ideas.'
        parameter :input_term, 'The input term for something.'
      end

      ValidationErrorHelper.new.error_fields(self, Phase)
      response_field :project, "Array containing objects with signature {error: 'is_not_timeline_project'}", scope: :errors
      response_field :base, "Array containing objects with signature {error: 'has_other_overlapping_phases'}", scope: :errors

      let(:project_id) { @project.id }
      let(:phase) { build(:phase) }
      let(:title_multiloc) { phase.title_multiloc }
      let(:description_multiloc) { phase.description_multiloc }
      let(:participation_method) { phase.participation_method }
      let(:min_budget) { 100 }
      let(:max_budget) { 1000 }
      let(:start_at) { phase.start_at }
      let(:end_at) { phase.end_at }

      example_request 'Create a phase for a project' do
        assert_status 201
        phase_id = json_response.dig(:data, :id)
        phase_in_db = Phase.find(phase_id)

        # A new ideation phase does not have a default form.
        expect(phase_in_db.custom_form).to be_nil

        expect(json_response.dig(:data, :attributes, :title_multiloc).stringify_keys).to match title_multiloc
        expect(json_response.dig(:data, :attributes, :description_multiloc).stringify_keys).to match description_multiloc
        expect(json_response.dig(:data, :attributes, :participation_method)).to eq participation_method
        expect(json_response.dig(:data, :attributes, :posting_enabled)).to be true
        expect(json_response.dig(:data, :attributes, :commenting_enabled)).to be true
        expect(json_response.dig(:data, :attributes, :voting_enabled)).to be true
        expect(json_response.dig(:data, :attributes, :downvoting_enabled)).to be true
        expect(json_response.dig(:data, :attributes, :upvoting_method)).to eq 'unlimited'
        expect(json_response.dig(:data, :attributes, :upvoting_limited_max)).to eq 10
        expect(json_response.dig(:data, :attributes, :min_budget)).to eq 100
        expect(json_response.dig(:data, :attributes, :max_budget)).to eq 1000
        expect(json_response.dig(:data, :attributes, :start_at)).to eq start_at.to_s
        expect(json_response.dig(:data, :attributes, :end_at)).to eq end_at.to_s
        expect(json_response.dig(:data, :relationships, :project, :data, :id)).to eq project_id
      end

      context 'native survey' do
        let(:phase) { build(:native_survey_phase) }
        let(:min_budget) { nil }
        let(:max_budget) { nil }

        example 'Create a native survey phase', document: false do
          do_request
          assert_status 201
          phase_id = json_response.dig(:data, :id)
          phase_in_db = Phase.find(phase_id)

          # A new native survey phase has a default form.
          fields = phase_in_db.custom_form.custom_fields
          expect(fields.size).to eq 2
          expect(fields.map(&:ordering)).to eq([0, 1])
          field1 = fields[0]
          expect(field1.input_type).to eq 'page'
          field2 = fields[1]
          expect(field2.input_type).to eq 'select'
          expect(field2.title_multiloc).to match({
            'en' => an_instance_of(String),
            'fr-FR' => an_instance_of(String),
            'nl-NL' => an_instance_of(String)
          })
          options = field2.options
          expect(options.size).to eq 2
          expect(options[0].key).to eq 'option1'
          expect(options[1].key).to eq 'option2'
          expect(options[0].title_multiloc).to match({
            'en' => an_instance_of(String),
            'fr-FR' => an_instance_of(String),
            'nl-NL' => an_instance_of(String)
          })
          expect(options[1].title_multiloc).to match({
            'en' => an_instance_of(String),
            'fr-FR' => an_instance_of(String),
            'nl-NL' => an_instance_of(String)
          })

          expect(phase_in_db.participation_method).to eq 'native_survey'
          expect(phase_in_db.title_multiloc).to match title_multiloc
          expect(phase_in_db.description_multiloc).to match description_multiloc
          expect(phase_in_db.start_at).to eq start_at
          expect(phase_in_db.end_at).to eq end_at
          expect(phase_in_db.min_budget).to be_nil
          expect(phase_in_db.max_budget).to be_nil

          # A native survey phase still has some ideation-related state, all column defaults.
          expect(phase_in_db.input_term).to eq 'idea'
          expect(phase_in_db.presentation_mode).to eq 'card'
          expect(json_response.dig(:data, :attributes, :posting_enabled)).to be true
          expect(json_response.dig(:data, :attributes, :commenting_enabled)).to be true
          expect(json_response.dig(:data, :attributes, :voting_enabled)).to be true
          expect(json_response.dig(:data, :attributes, :downvoting_enabled)).to be true
          expect(json_response.dig(:data, :attributes, :upvoting_method)).to eq 'unlimited'
          expect(json_response.dig(:data, :attributes, :upvoting_limited_max)).to eq 10
        end
      end

      describe do
        let(:start_at) { nil }

        example_request '[error] Create an invalid phase', document: false do
          assert_status 422
          expect(json_response).to include_response_error(:start_at, 'blank')
        end
      end

      describe do
        before do
          @project.phases.each(&:destroy!)
          create(:phase, project: @project, start_at: Time.now - 2.days, end_at: Time.now + 2.days)
        end

        let(:start_at) { Time.now }
        let(:end_at) { Time.now + 4.days }

        example_request '[error] Create an overlapping phase' do
          assert_status 422
          expect(json_response).to include_response_error(:base, 'has_other_overlapping_phases')
        end
      end

      describe do
        let(:participation_method) { 'survey' }
        let(:survey_embed_url) { 'https://citizenlabco.typeform.com/to/StrNJP' }
        let(:survey_service) { 'typeform' }

        example 'Create a survey phase', document: false do
          do_request
          assert_status 201
          expect(json_response.dig(:data, :attributes, :survey_embed_url)).to eq survey_embed_url
          expect(json_response.dig(:data, :attributes, :survey_service)).to eq survey_service
        end
      end

      describe do
        let(:participation_method) { 'budgeting' }
        let(:max_budget) { 420_000 }
        let(:ideas_order) { 'new' }

        example 'Create a participatory budgeting phase', document: false do
          do_request
          assert_status 201
          expect(json_response.dig(:data, :attributes, :max_budget)).to eq max_budget
          expect(json_response.dig(:data, :attributes, :ideas_order)).to be_present
          expect(json_response.dig(:data, :attributes, :ideas_order)).to eq 'new'
          expect(json_response.dig(:data, :attributes, :input_term)).to be_present
          expect(json_response.dig(:data, :attributes, :input_term)).to eq 'idea'
        end
      end

      describe do
        before do
          @project.phases.first.update(
            participation_method: 'budgeting',
            max_budget: 30_000
          )
        end

        let(:participation_method) { 'budgeting' }
        let(:max_budget) { 420_000 }

        example '[error] Create multiple budgeting phases', document: false do
          do_request
          assert_status 422
          expect(json_response).to include_response_error(:base, 'has_other_budgeting_phases')
        end
      end

      describe do
        let(:description_multiloc) do
          {
            'en' => '<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />'
          }
        end

        example 'Create a phase with text image', document: false do
          ti_count = TextImage.count
          do_request
          assert_status 201
          expect(TextImage.count).to eq(ti_count + 1)
        end

        example '[error] Create a phase with text image without start and end date', document: false do
          ti_count = TextImage.count
          do_request phase: { start_at: nil, end_at: nil }

          assert_status 422
          expect(json_response[:errors].keys & %i[start_at end_at]).to be_present
          expect(TextImage.count).to eq ti_count
        end
      end
    end

    patch 'web_api/v1/phases/:id' do
      with_options scope: :phase do
        parameter :project_id, 'The id of the project this phase belongs to'
        parameter :title_multiloc, 'The title of the phase in nultiple locales'
        parameter :description_multiloc, 'The description of the phase in multiple languages. Supports basic HTML.'
        parameter :participation_method, "The participation method of the project, either #{ParticipationContext::PARTICIPATION_METHODS.join(',')}. Defaults to ideation.", required: false
        parameter :posting_enabled, 'Can citizens post ideas in this phase?', required: false
        parameter :posting_method, "How does posting work? Either #{ParticipationContext::POSTING_METHODS.join(',')}. Defaults to unlimited for ideation, and limited to one for native surveys.", required: false
        parameter :posting_limited_max, 'Number of posts a citizen can perform in this phase. Defaults to 1', required: false
        parameter :commenting_enabled, 'Can citizens post comment in this phase?', required: false
        parameter :voting_enabled, 'Can citizens vote in this phase?', required: false
        parameter :upvoting_method, "How does upvoting work? Either #{ParticipationContext::VOTING_METHODS.join(',')}", required: false
        parameter :upvoting_limited_max, 'Number of upvotes a citizen can perform in this phase, only if the upvoting_method is limited', required: false
        parameter :downvoting_enabled, 'Can citizens vote in this phase?', required: false
        parameter :downvoting_method, "How does downvoting work? Either #{ParticipationContext::VOTING_METHODS.join(',')}", required: false
        parameter :downvoting_limited_max, 'Number of downvotes a citizen can perform in this phase, only if the downvoting_method is limited', required: false
        parameter :presentation_mode, "Describes the presentation of the project's items (i.e. ideas), either #{ParticipationContext::PRESENTATION_MODES.join(',')}.", required: false
        parameter :survey_embed_url, 'The identifier for the survey from the external API, if participation_method is set to survey', required: false
        parameter :survey_service, "The name of the service of the survey. Either #{Surveys::SurveyParticipationContext::SURVEY_SERVICES.join(',')}", required: false
        parameter :max_budget, 'The maximal budget amount each citizen can spend during participatory budgeting.', required: false
        parameter :start_at, 'The start date of the phase'
        parameter :end_at, 'The end date of the phase'
        parameter :poll_anonymous, "Are users associated with their answer? Only applies if participation_method is 'poll'. Can't be changed after first answer.", required: false
      end
      ValidationErrorHelper.new.error_fields(self, Phase)
      response_field :project, "Array containing objects with signature {error: 'is_not_timeline_project'}", scope: :errors
      response_field :base, "Array containing objects with signature {error: 'has_other_overlapping_phases'}", scope: :errors

      let(:phase) { create(:phase, project: @project) }
      let(:id) { phase.id }
      let(:description_multiloc) { phase.description_multiloc }
      let(:participation_method) { phase.participation_method }
      let(:posting_enabled) { false }
      let(:posting_method) { 'limited' }
      let(:posting_limited_max) { 5 }
      let(:commenting_enabled) { false }
      let(:voting_enabled) { true }
      let(:upvoting_method) { 'limited' }
      let(:upvoting_limited_max) { 6 }
      let(:presentation_mode) { 'map' }

      example_request 'Update a phase' do
        expect(response_status).to eq 200
        expect(json_response.dig(:data, :attributes, :description_multiloc).stringify_keys).to match description_multiloc
        expect(json_response.dig(:data, :attributes, :participation_method)).to eq participation_method
        expect(json_response.dig(:data, :attributes, :posting_enabled)).to eq posting_enabled
        expect(json_response.dig(:data, :attributes, :posting_method)).to eq posting_method
        expect(json_response.dig(:data, :attributes, :posting_limited_max)).to eq posting_limited_max
        expect(json_response.dig(:data, :attributes, :commenting_enabled)).to eq commenting_enabled
        expect(json_response.dig(:data, :attributes, :voting_enabled)).to eq voting_enabled
        expect(json_response.dig(:data, :attributes, :upvoting_method)).to eq upvoting_method
        expect(json_response.dig(:data, :attributes, :upvoting_limited_max)).to eq upvoting_limited_max
        expect(json_response.dig(:data, :attributes, :presentation_mode)).to eq presentation_mode
      end

      describe do
        before do
          @project.phases.first.update!(
            participation_method: 'budgeting',
            max_budget: 30_000
          )
        end

        let(:ideas) { create_list(:idea, 2, project: @project) }
        let(:phase) { create(:phase, project: @project, participation_method: 'ideation', ideas: ideas) }
        let(:participation_method) { 'information' }

        example 'Make a phase with ideas an information phase' do
          do_request
          expect(response_status).to eq 200
        end
      end

      describe 'When updating ideation phase with ideas to a poll phase' do
        before do
          phase.update!(
            participation_method: 'ideation',
            ideas: create_list(:idea, 2, project: @project)
          )
        end

        let(:ideas_phase) { phase.ideas[0].ideas_phases.first }
        let(:participation_method) { 'poll' }

        example 'Existing related ideas_phase remains valid' do
          expect(ideas_phase.valid?).to be true
          do_request
          ideas_phase.reload
          expect(response_status).to eq 200
          expect(ideas_phase.valid?).to be true
        end
      end
    end

    delete 'web_api/v1/phases/:id' do
      let(:phase) { create(:phase, project: @project) }
      let(:id) { phase.id }

      example_request 'Delete a phase' do
        expect(response_status).to eq 200
        expect { Comment.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
      end

      context 'on a native survey phase' do
        let(:phase) { create :phase, participation_method: 'native_survey', project: @project }

        example 'Deleting a phase deletes all survey responses', document: false do
          ideation_phase = create :phase, participation_method: 'ideation', project: @project, start_at: (phase.start_at - 7.days), end_at: (phase.start_at - 1.day)
          idea = create :idea, project: @project, phases: [ideation_phase]
          responses = create_list :idea, 2, project: @project, creation_phase: phase, phases: [phase]

          do_request

          expect { idea.reload }.not_to raise_error(ActiveRecord::RecordNotFound)
          responses.each do |response|
            expect { response.reload }.to raise_error(ActiveRecord::RecordNotFound)
          end
        end
      end

      context 'on an ideation phase' do
        let(:phase) { create :phase, participation_method: 'ideation', project: @project }

        example 'Deleting a phase does not delete the ideas', document: false do
          idea = create :idea, project: @project, phases: [phase]

          do_request

          expect { idea.reload }.not_to raise_error(ActiveRecord::RecordNotFound)
        end
      end
    end

    delete 'web_api/v1/phases/:id/inputs' do
      let(:project) { create(:project_with_active_native_survey_phase) }
      let(:active_phase) { project.phases.order(:start_at).last }
      let(:id) { active_phase.id }

      example 'Delete all inputs of a phase' do
        ideation_phase = create(
          :phase,
          project: project,
          participation_method: 'ideation',
          start_at: (Time.now - 2.months),
          end_at: (Time.now - 1.month)
        )
        create_list :idea, 2, project: project, phases: [active_phase]
        create :idea, project: project, phases: [ideation_phase]
        expect_any_instance_of(SideFxPhaseService).to receive(:after_delete_inputs)

        do_request
        assert_status 200
        expect(Phase.find(id)).to eq active_phase
        expect(project.reload.ideas_count).to eq 1
        expect(active_phase.reload.ideas_count).to eq 0
        expect(ideation_phase.reload.ideas_count).to eq 1
        expect(Idea.count).to eq 1
      end
    end
  end
end
