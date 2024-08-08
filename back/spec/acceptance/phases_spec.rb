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
    @project.phases = create_list(:phase_sequence, 2, project: @project)
  end

  get 'web_api/v1/projects/:project_id/phases' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of phases per page'
    end
    let(:project_id) { @project.id }

    example 'List all phases of a project' do
      Permissions::PermissionsUpdateService.new.update_all_permissions
      do_request
      assert_status 200
      expect(json_response[:data].size).to eq 2
      expect(json_response[:included].pluck(:type)).to include 'permission'
    end
  end

  get 'web_api/v1/phases/:id' do
    before { @phase = @project.phases.first }

    let(:id) { @phase.id }

    example 'Get one phase by id' do
      create_list(:idea, 2, project: @project, phases: @project.phases)
      Permissions::PermissionsUpdateService.new.update_all_permissions
      @phase.update!(report: build(:report))
      do_request
      assert_status 200

      expect(json_response.dig(:data, :id)).to eq @phase.id
      expect(json_response.dig(:data, :type)).to eq 'phase'
      expect(json_response.dig(:data, :attributes)).to include(
        reacting_like_method: 'unlimited',
        ideas_count: 2
      )

      expect(json_response.dig(:data, :relationships, :project)).to match({
        data: { id: @phase.project_id, type: 'project' }
      })

      expect(json_response.dig(:data, :relationships, :report)).to match({
        data: { id: @phase.report.id, type: 'report' }
      })

      expect(json_response.dig(:data, :relationships, :permissions, :data).size)
        .to eq(Permission.available_actions(@phase).length)

      expect(json_response[:included].pluck(:type)).to include 'permission'
    end
  end

  get 'web_api/v1/phases/:id/submission_count' do
    let(:phase) { create(:native_survey_phase) }
    let(:id) { phase.id }

    before do
      create_list(:native_survey_response, 2, creation_phase: phase, project: phase.project, phases: [phase])
      create_list(:idea, 3, project: phase.project, phases: [phase])
    end

    context 'native survey' do
      example 'Get count when native survey phase (ignores ideas)' do
        do_request
        assert_status 200
        expect(response_data[:attributes]).to eq({ totalSubmissions: 2 })
      end
    end

    context 'ideation' do
      example 'Get count for ideation phase (ignores native survey responses)' do
        phase.update!(participation_method: 'ideation')
        do_request
        assert_status 200
        expect(response_data[:attributes]).to eq({ totalSubmissions: 3 })
      end
    end
  end

  get 'web_api/v1/phases/:id/as_xlsx' do
    describe do
      let(:id) { create(:project_with_active_ideation_phase).phases.first.id }

      example '[error] Try downloading phase inputs' do
        do_request
        assert_status 401
      end
    end
  end

  delete 'web_api/v1/phases/:id/inputs' do
    let(:project) { create(:project_with_active_native_survey_phase) }
    let(:active_phase) { project.phases.first }
    let(:id) { active_phase.id }

    example '[error] Delete all inputs of a phase' do
      create(:idea, project: project, phases: [active_phase])

      do_request
      assert_status 401
    end
  end

  context 'when admin' do
    before { admin_header_token }

    post 'web_api/v1/projects/:project_id/phases' do
      with_options scope: :phase do
        parameter :title_multiloc, 'The title of the phase in nultiple locales', required: true
        parameter :description_multiloc, 'The description of the phase in multiple languages. Supports basic HTML.', required: false
        parameter :participation_method, "The participation method of the project, either #{Phase::PARTICIPATION_METHODS.join(',')}. Defaults to ideation.", required: false
        parameter :posting_enabled, 'Can citizens post ideas in this phase? Defaults to true', required: false
        parameter :commenting_enabled, 'Can citizens post comment in this phase? Defaults to true', required: false
        parameter :reacting_enabled, 'Can citizens react in this phase? Defaults to true', required: false
        parameter :reacting_like_method, "How does reacting work? Either #{Phase::REACTING_METHODS.join(',')}. Defaults to unlimited", required: false
        parameter :reacting_like_limited_max, 'Number of likes a citizen can perform in this phase, only if the reacting_like_method is limited. Defaults to 10', required: false
        parameter :reacting_dislike_enabled, 'Can citizens dislikes in this phase? Defaults to true', required: false
        parameter :reacting_dislike_method, "How does disliking work? Either #{Phase::REACTING_METHODS.join(',')}. Defaults to unlimited", required: false
        parameter :reacting_dislike_limited_max, 'Number of dislikes a citizen can perform in this phase, only if the reacting_dislike_method is limited. Defaults to 10', required: false
        parameter :allow_anonymous_participation, 'Only for ideation and budgeting phases. Allow users to post inputs and comments anonymously. Defaults to false', required: false
        parameter :presentation_mode, "Describes the presentation of the project's items (i.e. ideas), either #{Phase::PRESENTATION_MODES.join(',')}.", required: false
        parameter :survey_embed_url, 'The identifier for the survey from the external API, if participation_method is set to survey', required: false
        parameter :survey_service, "The name of the service of the survey. Either #{Surveys::SurveyPhase::SURVEY_SERVICES.join(',')}", required: false
        parameter :voting_method, "Either #{Phase::VOTING_METHODS.join(',')}. Required when the participation method is voting.", required: false
        parameter :voting_min_total, 'The minimum value a basket can have.', required: false
        parameter :voting_max_total, 'The maximal value a basket can have during voting. Required when the voting method is budgeting.', required: false
        parameter :voting_max_votes_per_idea, 'The maximum amount of votes that can be assigned on the same idea.', required: false
        parameter :voting_term_singular_multiloc, 'A multiloc term that is used to refer to the voting in singular form', required: false
        parameter :voting_term_plural_multiloc, 'A multiloc term that is used to refer to the voting in plural form', required: false
        parameter :start_at, 'The start date of the phase', required: true
        parameter :end_at, 'The end date of the phase', required: true
        parameter :poll_anonymous, "Are users associated with their answer? Defaults to false. Only applies if participation_method is 'poll'", required: false
        parameter :ideas_order, 'The default order of ideas.'
        parameter :input_term, 'The input term for something.'
        parameter :campaigns_settings, "A hash, only including keys in #{Phase::CAMPAIGNS} and with only boolean values", required: true
        parameter :native_survey_title_multiloc, 'A title for the native survey.'
        parameter :native_survey_button_multiloc, 'Text for native survey call to action button.'
      end

      ValidationErrorHelper.new.error_fields(self, Phase)
      response_field :project, "Array containing objects with signature {error: 'is_not_timeline_project'}", scope: :errors
      response_field :base, "Array containing objects with signature {error: 'has_other_overlapping_phases'}", scope: :errors

      let(:project_id) { @project.id }
      let(:phase) { build(:phase) }
      let(:title_multiloc) { phase.title_multiloc }
      let(:description_multiloc) { phase.description_multiloc }
      let(:participation_method) { phase.participation_method }
      let(:start_at) { phase.start_at }
      let(:end_at) { phase.end_at }
      let(:campaigns_settings) { phase.campaigns_settings }

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
        expect(json_response.dig(:data, :attributes, :reacting_enabled)).to be true
        expect(json_response.dig(:data, :attributes, :reacting_dislike_enabled)).to be true
        expect(json_response.dig(:data, :attributes, :reacting_like_method)).to eq 'unlimited'
        expect(json_response.dig(:data, :attributes, :reacting_like_limited_max)).to eq 10
        expect(json_response.dig(:data, :attributes, :start_at)).to eq start_at.to_s
        expect(json_response.dig(:data, :attributes, :end_at)).to eq end_at.to_s
        expect(json_response.dig(:data, :attributes, :previous_phase_end_at_updated)).to be false
        expect(json_response.dig(:data, :relationships, :project, :data, :id)).to eq project_id
      end

      describe do
        with_options scope: :phase do
          parameter :expire_days_limit, 'Default value for how many days a proposal has to meet the voting threshold and move to the next stage. Defaults to 90.'
          parameter :reacting_threshold, 'Default value for how many votes (reactions) a proposal needs to move to the next stage. Defaults to 300.'
        end

        let(:participation_method) { 'proposals' }
        let(:expire_days_limit) { 100 }
        let(:reacting_threshold) { 500 }

        example_request 'Create a proposals phase' do
          assert_status 201
          expect(json_response.dig(:data, :attributes, :expire_days_limit)).to eq 100
          expect(json_response.dig(:data, :attributes, :reacting_threshold)).to eq 500
        end
      end

      context 'Blank phase end dates' do
        let(:start_at) { @project.phases.last.end_at + 5.days }
        let(:end_at) { nil }

        example_request 'Create a phase for a project with an open end date' do
          assert_status 201
          expect(json_response.dig(:data, :attributes, :end_at)).to be_nil
        end
      end

      context 'Creating a new phase when a previous phase exists with no end date' do
        let(:start_at) { @new_phase_start }
        let(:end_at) { @new_phase_start + 5.days }

        before do
          @new_phase_start = @project.phases.last.end_at + 1.day
          @project.phases.last.update!(end_at: nil)
        end

        example 'Create a phase on a project with an open ended last phase' do
          do_request

          assert_status 201
          expect(json_response.dig(:data, :attributes, :previous_phase_end_at_updated)).to be true
          expect(@project.phases.last.reload.end_at).not_to be_nil
        end
      end

      describe 'voting phases' do
        let(:participation_method) { 'voting' }

        context 'budgeting' do
          let(:voting_method) { 'budgeting' }
          let(:voting_max_total) { 100 }
          let(:voting_min_total) { 10 }

          example_request 'Create a voting (budgeting) phase' do
            assert_status 201
            expect(response_data.dig(:attributes, :participation_method)).to eq 'voting'
            expect(response_data.dig(:attributes, :voting_method)).to eq 'budgeting'
            expect(response_data.dig(:attributes, :voting_max_total)).to eq 100
            expect(response_data.dig(:attributes, :voting_min_total)).to eq 10
            expect(response_data.dig(:attributes, :ideas_order)).to eq 'random'
          end
        end

        context 'multiple voting' do
          let(:voting_method) { 'multiple_voting' }
          let(:voting_max_total) { 10 }
          let(:voting_max_votes_per_idea) { 5 }
          let(:voting_term_singular_multiloc) { { 'en' => 'bean' } }
          let(:voting_term_plural_multiloc) { { 'en' => 'beans' } }

          example_request 'Create a voting (multiple voting) phase' do
            assert_status 201
            expect(response_data.dig(:attributes, :participation_method)).to eq 'voting'
            expect(response_data.dig(:attributes, :voting_method)).to eq 'multiple_voting'
            expect(response_data.dig(:attributes, :voting_max_total)).to eq 10
            expect(response_data.dig(:attributes, :voting_min_total)).to eq 0
            expect(response_data.dig(:attributes, :voting_max_votes_per_idea)).to eq 5
            expect(response_data.dig(:attributes, :voting_term_singular_multiloc, :en)).to eq 'bean'
            expect(response_data.dig(:attributes, :voting_term_plural_multiloc, :en)).to eq 'beans'
            expect(response_data.dig(:attributes, :ideas_order)).to eq 'random'
          end
        end

        context 'single voting' do
          let(:voting_method) { 'single_voting' }

          example_request 'Create a voting (single voting) phase' do
            assert_status 201
            expect(response_data.dig(:attributes, :participation_method)).to eq 'voting'
            expect(response_data.dig(:attributes, :voting_method)).to eq 'single_voting'
            expect(response_data.dig(:attributes, :voting_max_total)).to be_nil
            expect(response_data.dig(:attributes, :voting_min_total)).to eq 0
            expect(response_data.dig(:attributes, :voting_max_votes_per_idea)).to eq 1
            expect(response_data.dig(:attributes, :ideas_order)).to eq 'random'
          end
        end
      end

      context 'native survey' do
        let(:phase) { build(:native_survey_phase) }
        let(:native_survey_title_multiloc) { { 'en' => 'Planning survey' } }
        let(:native_survey_button_multiloc) { { 'en' => 'Fill in the form' } }

        example 'Create a native survey phase', document: false do
          do_request
          assert_status 201
          phase_id = json_response.dig(:data, :id)
          phase_in_db = Phase.find(phase_id)

          # A new native survey phase does not have a default form.
          expect(phase_in_db.custom_form).to be_nil

          expect(phase_in_db.participation_method).to eq 'native_survey'
          expect(phase_in_db.title_multiloc).to match title_multiloc
          expect(phase_in_db.description_multiloc).to match description_multiloc
          expect(phase_in_db.start_at).to eq start_at
          expect(phase_in_db.end_at).to eq end_at
          expect(phase_in_db.native_survey_title_multiloc['en']).to eq 'Planning survey'
          expect(phase_in_db.native_survey_button_multiloc['en']).to eq 'Fill in the form'
          expect(json_response.dig(:data, :attributes, :native_survey_title_multiloc, :en)).to eq 'Planning survey'
          expect(json_response.dig(:data, :attributes, :native_survey_button_multiloc, :en)).to eq 'Fill in the form'

          # A native survey phase still has some ideation-related state, all column defaults.
          expect(phase_in_db.input_term).to eq 'idea'
          expect(phase_in_db.presentation_mode).to eq 'card'
          expect(json_response.dig(:data, :attributes, :posting_enabled)).to be true
          expect(json_response.dig(:data, :attributes, :commenting_enabled)).to be true
          expect(json_response.dig(:data, :attributes, :reacting_enabled)).to be true
          expect(json_response.dig(:data, :attributes, :reacting_dislike_enabled)).to be true
          expect(json_response.dig(:data, :attributes, :reacting_like_method)).to eq 'unlimited'
          expect(json_response.dig(:data, :attributes, :reacting_like_limited_max)).to eq 10
        end
      end

      describe do
        let(:start_at) { nil }

        example '[error] Create an invalid phase', document: false do
          do_request
          assert_status 422
          expect(json_response).to include_response_error(:start_at, 'blank')
        end
      end

      describe do
        before do
          @project.phases.each(&:destroy!)
          @project.phases << create(:phase, project: @project, start_at: Time.now - 2.days, end_at: Time.now + 2.days)
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

      # ?

      describe do
        before { create(:budgeting_phase, project: @project, start_at: '2000-01-01', end_at: '2000-01-05') }

        let(:participation_method) { 'voting' }
        let(:voting_method) { 'budgeting' }
        let(:voting_max_total) { 300 }

        example 'Create multiple voting phases with the same voting method', document: false do
          do_request
          assert_status 201
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
        parameter :participation_method, "The participation method of the project, either #{Phase::PARTICIPATION_METHODS.join(',')}. Defaults to ideation.", required: false
        parameter :posting_enabled, 'Can citizens post ideas in this phase?', required: false
        parameter :commenting_enabled, 'Can citizens post comment in this phase?', required: false
        parameter :reacting_enabled, 'Can citizens react in this phase?', required: false
        parameter :reacting_like_method, "How does liking work? Either #{Phase::REACTING_METHODS.join(',')}", required: false
        parameter :reacting_like_limited_max, 'Number of likes a citizen can perform in this phase, only if the reacting_like_method is limited', required: false
        parameter :reacting_dislike_enabled, 'Can citizens react in this phase?', required: false
        parameter :reacting_dislike_method, "How does disliking work? Either #{Phase::REACTING_METHODS.join(',')}", required: false
        parameter :reacting_dislike_limited_max, 'Number of dislikes a citizen can perform in this phase, only if the reacting_dislike_method is limited', required: false
        parameter :allow_anonymous_participation, 'Only for ideation and budgeting phases. Allow users to post inputs and comments anonymously.', required: false
        parameter :presentation_mode, "Describes the presentation of the project's items (i.e. ideas), either #{Phase::PRESENTATION_MODES.join(',')}.", required: false
        parameter :survey_embed_url, 'The identifier for the survey from the external API, if participation_method is set to survey', required: false
        parameter :survey_service, "The name of the service of the survey. Either #{Surveys::SurveyPhase::SURVEY_SERVICES.join(',')}", required: false
        parameter :voting_method, "Either #{Phase::VOTING_METHODS.join(',')}", required: false
        parameter :voting_min_total, 'The minimum value a basket can have.', required: false
        parameter :voting_max_total, 'The maximal value a basket can have during voting', required: false
        parameter :voting_max_votes_per_idea, 'The maximum amount of votes that can be assigned on the same idea.', required: false
        parameter :voting_term_singular_multiloc, 'A multiloc term that is used to refer to the voting in singular form', required: false
        parameter :voting_term_plural_multiloc, 'A multiloc term that is used to refer to the voting in plural form', required: false
        parameter :start_at, 'The start date of the phase'
        parameter :end_at, 'The end date of the phase'
        parameter :poll_anonymous, "Are users associated with their answer? Only applies if participation_method is 'poll'. Can't be changed after first answer.", required: false
        parameter :ideas_order, 'The default order of ideas.'
      end
      ValidationErrorHelper.new.error_fields(self, Phase)
      response_field :project, "Array containing objects with signature {error: 'is_not_timeline_project'}", scope: :errors
      response_field :base, "Array containing objects with signature {error: 'has_other_overlapping_phases'}", scope: :errors

      let(:phase) { create(:phase, project: @project) }
      let(:id) { phase.id }
      let(:description_multiloc) { phase.description_multiloc }
      let(:participation_method) { phase.participation_method }
      let(:posting_enabled) { false }
      let(:commenting_enabled) { false }
      let(:reacting_enabled) { true }
      let(:reacting_like_method) { 'limited' }
      let(:reacting_like_limited_max) { 6 }
      let(:presentation_mode) { 'map' }
      let(:allow_anonymous_participation) { true }

      example_request 'Update a phase' do
        expect(response_status).to eq 200
        expect(json_response.dig(:data, :attributes, :description_multiloc).stringify_keys).to match description_multiloc
        expect(json_response.dig(:data, :attributes, :participation_method)).to eq participation_method
        expect(json_response.dig(:data, :attributes, :posting_enabled)).to eq posting_enabled
        expect(json_response.dig(:data, :attributes, :commenting_enabled)).to eq commenting_enabled
        expect(json_response.dig(:data, :attributes, :reacting_enabled)).to eq reacting_enabled
        expect(json_response.dig(:data, :attributes, :reacting_like_method)).to eq reacting_like_method
        expect(json_response.dig(:data, :attributes, :reacting_like_limited_max)).to eq reacting_like_limited_max
        expect(json_response.dig(:data, :attributes, :presentation_mode)).to eq presentation_mode
        expect(json_response.dig(:data, :attributes, :allow_anonymous_participation)).to eq allow_anonymous_participation
      end

      describe do
        with_options scope: :phase do
          parameter :expire_days_limit, 'Default value for how many days a proposal has to meet the voting threshold and move to the next stage.'
          parameter :reacting_threshold, 'Default value for how many votes (reactions) a proposal needs to move to the next stage.'
        end

        let(:id) { create(:proposals_phase).id }
        let(:participation_method) { 'proposals' }
        let(:expire_days_limit) { 100 }
        let(:reacting_threshold) { 500 }

        example_request 'Update a proposals phase' do
          assert_status 200
          expect(json_response.dig(:data, :attributes, :expire_days_limit)).to eq 100
          expect(json_response.dig(:data, :attributes, :reacting_threshold)).to eq 500
        end
      end

      describe do
        let(:id) { create(:budgeting_phase).id }
        let(:participation_method) { 'voting' }
        let(:voting_min_total) { 3 }
        let(:voting_max_total) { 15 }
        let(:voting_max_votes_per_idea) { 1 } # Should ignore this
        let(:voting_term_singular_multiloc) { { 'en' => 'Grocery shopping' } }
        let(:voting_term_plural_multiloc) { { 'en' => 'Groceries shoppings' } }

        example_request 'Update a voting phase' do
          assert_status 200

          expect(json_response.dig(:data, :attributes, :voting_min_total)).to eq 3
          expect(json_response.dig(:data, :attributes, :voting_max_total)).to eq 15
          expect(json_response.dig(:data, :attributes, :voting_max_votes_per_idea)).to be_nil
          expect(json_response.dig(:data, :attributes, :voting_term_singular_multiloc, :en)).to eq 'Grocery shopping'
          expect(json_response.dig(:data, :attributes, :voting_term_plural_multiloc, :en)).to eq 'Groceries shoppings'
        end
      end

      describe do
        before do
          @project.phases.first.update!(
            participation_method: 'voting',
            voting_method: 'budgeting',
            voting_max_total: 30_000,
            ideas_order: 'random'
          )
        end

        let(:ideas) { create_list(:idea, 2, project: @project) }
        let(:phase) { create(:phase, project: @project, participation_method: 'ideation', ideas: ideas) }
        let(:participation_method) { 'information' }

        example 'Change a phase with ideas into an information phase' do
          expect_any_instance_of(Permissions::PermissionsUpdateService).to receive(:update_permissions_for_scope).with(phase)
          do_request
          assert_status 200
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
        let(:phase) { create(:native_survey_phase, project: @project) }

        example 'Deleting a phase deletes all survey responses', document: false do
          ideation_phase = create(:phase, participation_method: 'ideation', project: @project, start_at: (phase.start_at - 7.days), end_at: (phase.start_at - 1.day))
          idea = create(:idea, project: @project, phases: [ideation_phase])
          responses = create_list(:idea, 2, project: @project, creation_phase: phase, phases: [phase])

          do_request

          expect { idea.reload }.not_to raise_error(ActiveRecord::RecordNotFound)
          responses.each do |response|
            expect { response.reload }.to raise_error(ActiveRecord::RecordNotFound)
          end
        end
      end

      context 'on an ideation phase' do
        let(:phase) { create(:phase, participation_method: 'ideation', project: @project) }

        example 'Deleting a phase does not delete the ideas', document: false do
          idea = create(:idea, project: @project, phases: [phase])

          do_request

          expect { idea.reload }.not_to raise_error(ActiveRecord::RecordNotFound)
        end
      end
    end

    get 'web_api/v1/phases/:id/survey_results' do
      let(:project) { create(:project_with_active_native_survey_phase) }
      let(:active_phase) { project.phases.first }
      let(:form) { create(:custom_form, participation_context: active_phase) }
      let(:id) { active_phase.id }
      let(:multiselect_field) do
        create(
          :custom_field_multiselect,
          resource: form,
          title_multiloc: { 'en' => 'What are your favourite pets?' },
          description_multiloc: {},
          required: true
        )
      end
      let!(:cat_option) do
        create(:custom_field_option, custom_field: multiselect_field, key: 'cat', title_multiloc: { 'en' => 'Cat' })
      end
      let!(:dog_option) do
        create(:custom_field_option, custom_field: multiselect_field, key: 'dog', title_multiloc: { 'en' => 'Dog' })
      end
      let!(:survey_response1) do
        create(
          :idea,
          project: project,
          creation_phase: active_phase,
          phases: [active_phase],
          custom_field_values: { multiselect_field.key => %w[cat dog] }
        )
      end
      let!(:survey_response2) do
        create(
          :idea,
          project: project,
          creation_phase: active_phase,
          phases: [active_phase],
          custom_field_values: { multiselect_field.key => %w[cat] }
        )
      end

      example 'Get survey results' do
        do_request
        expect(status).to eq 200

        expect(response_data[:type]).to eq 'survey_results'
        expect(response_data.dig(:attributes, :totalSubmissions)).to eq 2
        expect(response_data.dig(:attributes, :results).count).to eq 1
        expect(response_data.dig(:attributes, :results, 0)).to match(
          {
            customFieldId: multiselect_field.id,
            inputType: 'multiselect',
            question: { en: 'What are your favourite pets?' },
            required: true,
            grouped: false,
            totalResponseCount: 2,
            questionResponseCount: 2,
            totalPickCount: 3,
            answers: [
              { answer: 'cat', count: 2 },
              { answer: 'dog', count: 1 },
              { answer: nil, count: 0 }
            ],
            multilocs: {
              answer: {
                cat: { title_multiloc: { en: 'Cat' } },
                dog: { title_multiloc: { en: 'Dog' } }
              }
            }
          }
        )
      end
    end

    get 'web_api/v1/phases/:id/submission_count' do
      let(:project) { create(:project_with_active_native_survey_phase) }
      let(:active_phase) { project.phases.first }
      let(:form) { create(:custom_form, participation_context: active_phase) }
      let(:id) { active_phase.id }
      let(:multiselect_field) do
        create(
          :custom_field_multiselect,
          resource: form,
          title_multiloc: { 'en' => 'What are your favourite pets?' },
          description_multiloc: {}
        )
      end
      let!(:cat_option) do
        create(:custom_field_option, custom_field: multiselect_field, key: 'cat', title_multiloc: { 'en' => 'Cat' })
      end
      let!(:dog_option) do
        create(:custom_field_option, custom_field: multiselect_field, key: 'dog', title_multiloc: { 'en' => 'Dog' })
      end
      let!(:survey_response1) do
        create(
          :idea,
          project: project,
          creation_phase: active_phase,
          phases: [active_phase],
          custom_field_values: { multiselect_field.key => %w[cat dog] }
        )
      end
      let!(:survey_response2) do
        create(
          :idea,
          project: project,
          creation_phase: active_phase,
          phases: [active_phase],
          custom_field_values: { multiselect_field.key => %w[cat] }
        )
      end
      let!(:survey_response3) do
        create(
          :idea,
          project: project,
          creation_phase: active_phase,
          phases: [active_phase],
          custom_field_values: { multiselect_field.key => %w[dog] }
        )
      end

      example 'Get submission count' do
        do_request
        expect(status).to eq 200

        expect(json_response[:data][:attributes]).to eq({ totalSubmissions: 3 })
      end
    end

    get 'web_api/v1/phases/:id/as_xlsx' do
      context 'for a native survey phase with persisted form' do
        let(:project) { create(:project_with_active_native_survey_phase) }
        let(:active_phase) { project.phases.first }
        let(:form) { create(:custom_form, participation_context: active_phase) }
        let(:id) { active_phase.id }

        # Create a page to describe that it is not included in the export.
        let!(:page_field) { create(:custom_field_page, resource: form) }
        let(:multiselect_field) do
          create(
            :custom_field_multiselect,
            resource: form,
            title_multiloc: { 'en' => 'What are your favourite pets?' },
            description_multiloc: {}
          )
        end
        let!(:cat_option) do
          create(:custom_field_option, custom_field: multiselect_field, key: 'cat', title_multiloc: { 'en' => 'Cat' })
        end
        let!(:dog_option) do
          create(:custom_field_option, custom_field: multiselect_field, key: 'dog', title_multiloc: { 'en' => 'Dog' })
        end

        context 'when there are inputs in the phase' do
          let!(:survey_response1) do
            create(
              :idea,
              project: project,
              creation_phase: active_phase,
              phases: [active_phase],
              custom_field_values: { multiselect_field.key => %w[cat dog] }
            )
          end
          let!(:survey_response2) do
            create(
              :idea,
              project: project,
              creation_phase: active_phase,
              phases: [active_phase],
              custom_field_values: { multiselect_field.key => %w[cat] }
            )
          end

          example 'Download native survey phase inputs in one sheet' do
            expected_params = [[survey_response1, survey_response2], active_phase, { view_private_attributes: true }]
            allow(XlsxExport::InputSheetGenerator).to receive(:new).and_return(XlsxExport::InputSheetGenerator.new(*expected_params))
            do_request
            expect(XlsxExport::InputSheetGenerator).to have_received(:new).with(*expected_params)

            assert_status 200
            expect(xlsx_contents(response_body)).to match([
              {
                sheet_name: active_phase.title_multiloc['en'],
                column_headers: [
                  'ID',
                  multiselect_field.title_multiloc['en'],
                  'Author name',
                  'Author email',
                  'Author ID',
                  'Submitted at',
                  'Project'
                ],
                rows: [
                  [
                    survey_response1.id,
                    'Cat, Dog',
                    survey_response1.author_name,
                    survey_response1.author.email,
                    survey_response1.author_id,
                    an_instance_of(DateTime), # created_at
                    project.title_multiloc['en']
                  ],
                  [
                    survey_response2.id,
                    'Cat',
                    survey_response2.author_name,
                    survey_response2.author.email,
                    survey_response2.author_id,
                    an_instance_of(DateTime), # created_at
                    project.title_multiloc['en']
                  ]
                ]
              }
            ])
          end

          example 'Draft responses are not included' do
            create(
              :idea,
              project: project,
              creation_phase: active_phase,
              phases: [active_phase],
              publication_status: 'draft'
            )
            do_request

            assert_status 200
            xlsx = xlsx_contents(response_body)
            expect(xlsx.first[:rows].size).to eq 2
          end
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
        create_list(:idea, 2, project: project, phases: [active_phase])
        create(:idea, project: project, phases: [ideation_phase])
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

  context 'when project moderator' do
    before { header_token_for create(:project_moderator, projects: [project]) }

    get 'web_api/v1/phases/:id/as_xlsx' do
      let(:project) { create(:project_with_active_native_survey_phase) }
      let(:active_phase) { project.phases.first }
      let(:form) { create(:custom_form, participation_context: active_phase) }
      let(:id) { active_phase.id }
      let(:multiselect_field) do
        create(
          :custom_field_multiselect,
          resource: form,
          title_multiloc: { 'en' => 'What are your favourite pets?' },
          description_multiloc: {}
        )
      end
      let!(:cat_option) do
        create(:custom_field_option, custom_field: multiselect_field, key: 'cat', title_multiloc: { 'en' => 'Cat' })
      end
      let!(:dog_option) do
        create(:custom_field_option, custom_field: multiselect_field, key: 'dog', title_multiloc: { 'en' => 'Dog' })
      end
      let!(:survey_response) do
        create(
          :idea,
          project: project,
          creation_phase: active_phase,
          phases: [active_phase],
          custom_field_values: { multiselect_field.key => %w[cat dog] }
        )
      end

      example 'Download phase inputs WITH private user data', document: false do
        expected_params = [[survey_response], active_phase, { view_private_attributes: true }]
        allow(XlsxExport::InputSheetGenerator).to receive(:new).and_return(XlsxExport::InputSheetGenerator.new(*expected_params))
        do_request
        expect(XlsxExport::InputSheetGenerator).to have_received(:new).with(*expected_params)
        assert_status 200
        expect(xlsx_contents(response_body)).to match([
          {
            sheet_name: active_phase.title_multiloc['en'],
            column_headers: [
              'ID',
              multiselect_field.title_multiloc['en'],
              'Author name',
              'Author email',
              'Author ID',
              'Submitted at',
              'Project'
            ],
            rows: [
              [
                survey_response.id,
                'Cat, Dog',
                survey_response.author_name,
                survey_response.author.email,
                survey_response.author_id,
                an_instance_of(DateTime), # created_at
                project.title_multiloc['en']
              ]
            ]
          }
        ])
      end
    end
  end
end
