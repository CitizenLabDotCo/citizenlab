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
    @project.phases = create_list(:phase_sequence, 2, project: @project, participation_method: 'voting', voting_method: 'single_voting')
  end

  get 'web_api/v1/projects/:project_id/phases' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of phases per page'
    end
    let(:project_id) { @project.id }

    context 'when visitor' do
      example 'List all phases of a project' do
        Permissions::PermissionsUpdateService.new.update_all_permissions
        do_request
        assert_status 200
        expect(json_response[:data].size).to eq 2
        expect(json_response[:included].pluck(:type)).to include 'permission'
      end

      example 'List all phases of a project which is hidden (internal_role: community_monitor)' do
        @project.update!(internal_role: 'community_monitor')
        Permissions::PermissionsUpdateService.new.update_all_permissions
        do_request
        assert_status 200
        expect(json_response[:data].size).to eq 2
      end
    end

    context 'when admin' do
      before { admin_header_token }

      example 'See the manual votes attributes' do
        admin = create(:admin)
        phase1, phase2 = @project.phases
        phase1.set_manual_voters(10, admin)
        phase1.save!
        create(:idea, project: @project, phases: [phase1], manual_votes_amount: 5)
        idea2 = create(:idea, project: @project, phases: [phase1, phase2], manual_votes_amount: 3)
        @project.phases.each(&:update_manual_votes_count!)
        create(:baskets_idea, basket: create(:basket, phase: phase1), idea: idea2, votes: 2)
        Basket.update_counts(phase1)

        do_request
        assert_status 200

        phase1_response = json_response_body[:data].find { |i| i[:id] == phase1.id }
        expect(phase1_response.dig(:attributes, :manual_voters_amount)).to eq 10
        expect(phase1_response.dig(:attributes, :manual_votes_count)).to eq 8
        expect(phase1_response.dig(:attributes, :votes_count)).to eq 2
        expect(phase1_response.dig(:attributes, :total_votes_amount)).to eq 10
        expect(phase1_response.dig(:relationships, :manual_voters_last_updated_by, :data, :id)).to eq admin.id
        expect(json_response_body[:included].find { |i| i[:id] == admin.id }&.dig(:attributes, :slug)).to eq admin.slug
        expect(phase1_response.dig(:attributes, :manual_voters_last_updated_at)).to be_present

        phase2_response = json_response_body[:data].find { |i| i[:id] == phase2.id }
        expect(phase2_response.dig(:attributes, :manual_voters_amount)).to be_nil
        expect(phase2_response.dig(:attributes, :manual_votes_count)).to eq 3
        expect(phase2_response.dig(:attributes, :votes_count)).to eq 0
        expect(phase2_response.dig(:attributes, :total_votes_amount)).to eq 3
        expect(phase2_response.dig(:relationships, :manual_voters_last_updated_by, :data, :id)).to be_nil
        expect(phase2_response.dig(:attributes, :manual_voters_last_updated_at)).to be_nil
      end
    end
  end

  get 'web_api/v1/phases/:id/mini' do
    before { @phase = @project.phases.first }

    let(:id) { @phase.id }

    example 'Get a phase by id' do
      @phase.update!(report: build(:report))
      do_request
      assert_status 200

      expect(json_response.dig(:data, :id)).to eq @phase.id
      expect(json_response.dig(:data, :type)).to eq 'phase_mini'

      expect(json_response.dig(:data, :relationships, :project)).to match({
        data: { id: @phase.project_id, type: 'project' }
      })

      expect(json_response.dig(:data, :relationships, :report)).to match({
        data: { id: @phase.report.id, type: 'report' }
      })
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

  get 'web_api/v1/phases/:id/progress' do
    explanation 'Get progress of the current user in a Common Ground phase'

    let_it_be(:phase) { create(:common_ground_phase) }
    let(:id) { phase.id }

    context 'when visitor' do
      example 'Unauthorized (401)', document: false do
        do_request
        assert_status 401
      end
    end

    context 'when logged in' do
      before do
        current_user = create(:user)
        header_token_for(current_user)

        i1, @i2 = create_pair(:idea, project: phase.project, phases: [phase])
        create(:reaction, reactable: i1, user: current_user)
      end

      # The next idea is necessarily the one that doesn't have a reaction
      let(:next_idea) { @i2 }

      example_request 'Get user progress' do
        assert_status 200

        expect(response_data).to match(
          id: phase.id,
          type: 'common_ground_progress',
          attributes: {
            num_ideas: 2,
            num_reacted_ideas: 1
          },
          relationships: {
            next_idea: { data: { id: next_idea.id, type: 'idea' } }
          }
        )

        expect(json_response_body[:included]).to include(
          hash_including(id: next_idea.id, type: 'idea')
        )
      end

      context 'when the phase is not "common ground"' do
        let(:id) { create(:phase).id }

        example 'Not found (404)', document: false do
          do_request
          assert_status 404
        end
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
        parameter :submission_enabled, 'Can citizens submit inputs in this phase? Defaults to true', required: false
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
        parameter :prescreening_enabled, 'Do inputs need to go through pre-screening before being published? Defaults to false', required: false
        parameter :similarity_enabled, 'Enable searching for similar inputs during submission. Defaults to false.', required: false
        parameter :similarity_threshold_title, 'The similarity threshold for the title of the input. Defaults to 0.3', required: false
        parameter :similarity_threshold_body, 'The similarity threshold for the body of the input. Defaults to 0.4', required: false
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
        expect(json_response.dig(:data, :attributes, :submission_enabled)).to be true
        expect(json_response.dig(:data, :attributes, :commenting_enabled)).to be true
        expect(json_response.dig(:data, :attributes, :reacting_enabled)).to be true
        expect(json_response.dig(:data, :attributes, :reacting_dislike_enabled)).to be false
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
          expect(json_response.dig(:data, :attributes, :participation_method)).to eq 'proposals'
          expect(json_response.dig(:data, :attributes, :expire_days_limit)).to eq 100
          expect(json_response.dig(:data, :attributes, :reacting_threshold)).to eq 500
          expect(json_response.dig(:data, :attributes, :reacting_dislike_enabled)).to be false
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
          expect(json_response.dig(:data, :attributes, :submission_enabled)).to be true
          expect(json_response.dig(:data, :attributes, :commenting_enabled)).to be true
          expect(json_response.dig(:data, :attributes, :reacting_enabled)).to be true
          expect(json_response.dig(:data, :attributes, :reacting_dislike_enabled)).to be false
          expect(json_response.dig(:data, :attributes, :reacting_like_method)).to eq 'unlimited'
          expect(json_response.dig(:data, :attributes, :reacting_like_limited_max)).to eq 10
        end
      end

      describe 'common ground' do
        let(:participation_method) { 'common_ground' }

        example_request 'Create a common ground phase', document: false do
          assert_status 201
          expect(response_data.dig(:attributes, :participation_method)).to eq('common_ground')

          phase = Phase.find(response_data[:id])
          expect(phase.participation_method).to eq('common_ground')

          expect(phase.reacting_enabled).to be(true)
          expect(phase.reacting_dislike_enabled).to be(true)
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
        parameter :title_multiloc, 'The title of the phase in multiple locales'
        parameter :description_multiloc, 'The description of the phase in multiple languages. Supports basic HTML.'
        parameter :participation_method, "The participation method of the project, either #{Phase::PARTICIPATION_METHODS.join(',')}. Defaults to ideation.", required: false
        parameter :submission_enabled, 'Can citizens post ideas in this phase?', required: false
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
        parameter :manual_voters_amount, 'The number of voters from collected offline votes.', required: false
        parameter :voting_term_singular_multiloc, 'A multiloc term that is used to refer to the voting in singular form', required: false
        parameter :voting_term_plural_multiloc, 'A multiloc term that is used to refer to the voting in plural form', required: false
        parameter :start_at, 'The start date of the phase'
        parameter :end_at, 'The end date of the phase'
        parameter :poll_anonymous, "Are users associated with their answer? Only applies if participation_method is 'poll'. Can't be changed after first answer.", required: false
        parameter :ideas_order, 'The default order of ideas.'
        parameter :prescreening_enabled, 'Do inputs need to go through pre-screening before being published?', required: false
        parameter :similarity_enabled, 'Enable searching for similar inputs during submission.', required: false
        parameter :similarity_threshold_title, 'The similarity threshold for the title of the input.', required: false
        parameter :similarity_threshold_body, 'The similarity threshold for the body of the input.', required: false
      end
      ValidationErrorHelper.new.error_fields(self, Phase)
      response_field :project, "Array containing objects with signature {error: 'is_not_timeline_project'}", scope: :errors
      response_field :base, "Array containing objects with signature {error: 'has_other_overlapping_phases'}", scope: :errors

      let(:phase) { create(:phase, project: @project) }
      let(:id) { phase.id }
      let(:description_multiloc) { phase.description_multiloc }
      let(:participation_method) { phase.participation_method }
      let(:submission_enabled) { false }
      let(:commenting_enabled) { false }
      let(:reacting_enabled) { true }
      let(:reacting_like_method) { 'limited' }
      let(:reacting_like_limited_max) { 6 }
      let(:presentation_mode) { 'map' }
      let(:allow_anonymous_participation) { true }
      let(:prescreening_enabled) { true }
      let(:similarity_enabled) { true }
      let(:similarity_threshold_body) { 0.2 }

      example_request 'Update a phase' do
        expect(response_status).to eq 200
        expect(json_response.dig(:data, :attributes, :description_multiloc).stringify_keys).to match description_multiloc
        expect(json_response.dig(:data, :attributes, :participation_method)).to eq participation_method
        expect(json_response.dig(:data, :attributes, :submission_enabled)).to eq submission_enabled
        expect(json_response.dig(:data, :attributes, :commenting_enabled)).to eq commenting_enabled
        expect(json_response.dig(:data, :attributes, :reacting_enabled)).to eq reacting_enabled
        expect(json_response.dig(:data, :attributes, :reacting_like_method)).to eq reacting_like_method
        expect(json_response.dig(:data, :attributes, :reacting_like_limited_max)).to eq reacting_like_limited_max
        expect(json_response.dig(:data, :attributes, :presentation_mode)).to eq presentation_mode
        expect(json_response.dig(:data, :attributes, :allow_anonymous_participation)).to eq allow_anonymous_participation
        expect(json_response.dig(:data, :attributes, :prescreening_enabled)).to eq prescreening_enabled
        expect(json_response.dig(:data, :attributes, :similarity_enabled)).to eq similarity_enabled
        expect(json_response.dig(:data, :attributes, :similarity_threshold_body)).to eq similarity_threshold_body
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
        let(:phase) { create(:budgeting_phase) }
        let(:id) { phase.id }
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

        describe do
          let(:manual_voters_amount) { 4 }

          example 'Set offline voters' do
            expect { do_request }
              .to enqueue_job(LogActivityJob).with(
                phase,
                'changed_manual_voters_amount',
                User.admin.first,
                anything,
                payload: { change: [nil, manual_voters_amount] },
                project_id: phase.project_id
              ).exactly(1).times

            phase.reload
            expect(phase.manual_voters_amount).to eq manual_voters_amount
            expect(phase.manual_voters_last_updated_by_id).to eq User.admin.first.id
            expect(phase.manual_voters_last_updated_at).to be_present
          end
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
      parameter :logic_ids, 'Array of page or option ids to filter the results by logic', required: false
      parameter :year, 'First month to include in the survey results', required: false
      parameter :quarter, 'Last month to include in the survey results', required: false

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
            description: {},
            required: true,
            grouped: false,
            hidden: false,
            pageNumber: nil,
            questionNumber: 1,
            questionCategory: nil,
            logic: {},
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

    get 'web_api/v1/phases/:id/common_ground_results' do
      let(:phase) { create(:common_ground_phase) }
      let(:id) { phase.id }

      context 'when not logged in' do
        def create_idea(phase, downvotes, neutral, upvotes)
          idea = create(:idea, project: phase.project, phases: [phase])
          create_list(:reaction, downvotes, reactable: idea, mode: 'down')
          create_list(:reaction, neutral, reactable: idea, mode: 'neutral')
          create_list(:reaction, upvotes, reactable: idea, mode: 'up')
          idea
        end

        let!(:i1) { create_idea(phase, 1, 0, 2) }
        let!(:i2) { create_idea(phase, 1, 1, 0) }
        let!(:i3) { create_idea(phase, 1, 1, 1) }

        before do
          # idea with only neutral reactions that should not be included in results
          create_idea(phase, 0, 1, 0)
        end

        example_request 'Get common ground results' do
          assert_status 200

          expect(response_data).to match(
            id: phase.id,
            type: 'common_ground_results',
            attributes: {
              top_consensus_ideas: be_an(Array),
              top_controversial_ideas: be_an(Array),
              stats: {
                num_participants: 9, # each reaction is from a different user
                num_ideas: 4,
                votes: { up: 3, down: 3, neutral: 3 }
              }
            }
          )

          expect(response_data.dig(:attributes, :top_consensus_ideas).pluck(:id)).to eq [i2.id, i1.id, i3.id]
          expect(response_data.dig(:attributes, :top_controversial_ideas).pluck(:id)).to eq [i3.id, i1.id, i2.id]

          top_controversial_idea = response_data.dig(:attributes, :top_controversial_ideas, 0)
          expect(top_controversial_idea.with_indifferent_access).to match(
            id: i3.id,
            title_multiloc: i3.title_multiloc,
            votes: { down: 1, neutral: 1, up: 1 }
          )

          top_consensus_idea = response_data.dig(:attributes, :top_consensus_ideas, 0)
          expect(top_consensus_idea.with_indifferent_access).to match(
            id: i2.id,
            title_multiloc: i2.title_multiloc,
            votes: { down: 1, neutral: 1, up: 0 }
          )
        end

        context 'when the phase is not "common ground"' do
          let(:id) { create(:phase).id }

          example 'Not found (404)', document: false do
            do_request
            assert_status 400
          end
        end
      end
    end

    get 'web_api/v1/phases/:id/sentiment_by_quarter' do
      let(:project) { create(:community_monitor_project) }
      let(:active_phase) { project.phases.first }
      let(:form) { create(:custom_form, participation_context: active_phase) }
      let(:sentiment_question1) { create(:custom_field_sentiment_linear_scale, resource: form, question_category: 'quality_of_life') }
      let(:sentiment_question2) { create(:custom_field_sentiment_linear_scale, resource: form, question_category: 'service_delivery') }

      let!(:survey_response1) do
        create(
          :native_survey_response,
          project: project,
          creation_phase: active_phase,
          custom_field_values: { sentiment_question1.key => 2, sentiment_question2.key => 4 },
          created_at: Time.new(2025, 1, 1)
        )
      end
      let!(:survey_response2) do
        create(
          :native_survey_response,
          project: project,
          creation_phase: active_phase,
          custom_field_values: { sentiment_question1.key => 3, sentiment_question2.key => 1 },
          created_at: Time.new(2025, 4, 1)
        )
      end

      let(:id) { active_phase.id }

      example 'Get survey sentiment by quarter' do
        do_request
        expect(status).to eq 200
        expect(response_data[:type]).to eq 'sentiment_by_quarter'
        expect(response_data[:attributes]).to eq({
          overall: {
            averages: { '2025-1': 3.0, '2025-2': 2.0 },
            totals: {
              '2025-1': { '1': 0, '2': 1, '3': 0, '4': 1, '5': 0 },
              '2025-2': { '1': 1, '2': 0, '3': 1, '4': 0, '5': 0 }
            }
          },
          categories: {
            averages: {
              quality_of_life: { '2025-2': 3.0, '2025-1': 2.0 },
              service_delivery: { '2025-2': 1.0, '2025-1': 4.0 },
              governance_and_trust: {},
              other: {}
            },
            multilocs: {
              quality_of_life: { en: 'Quality of life', 'fr-FR': 'Qualité de vie', 'nl-NL': 'Kwaliteit van leven' },
              service_delivery: { en: 'Service delivery', 'fr-FR': 'Prestation de services', 'nl-NL': 'Dienstverlening' },
              governance_and_trust: { en: 'Governance and trust', 'fr-FR': 'Gouvernance et confiance', 'nl-NL': 'Bestuur en vertrouwen' },
              other: { en: 'Other', 'fr-FR': 'Autre', 'nl-NL': 'Ander' }
            }
          }
        })
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

        before do
          config = AppConfiguration.instance
          config.settings['core']['private_attributes_in_export'] = true
          config.save!
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
            expected_params = [[survey_response1, survey_response2], active_phase]
            allow(Export::Xlsx::InputSheetGenerator).to receive(:new).and_return(Export::Xlsx::InputSheetGenerator.new(*expected_params))
            do_request
            expect(Export::Xlsx::InputSheetGenerator).to have_received(:new).with(*expected_params)

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
                    'Cat;Dog',
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

          # NOTE: Typically, survey responses have no displayable content.
          example 'Responses with no displayable content are included' do
            survey_response1.title_multiloc = {}
            survey_response1.body_multiloc = {}
            survey_response1.save!(validate: false)

            do_request
            assert_status 200
            xlsx = xlsx_contents(response_body)
            all_values = xlsx.flat_map { |sheet| sheet[:rows].flatten }
            expect(all_values).to include(survey_response1.id)
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
        config = AppConfiguration.instance
        config.settings['core']['private_attributes_in_export'] = true
        config.save!
        expected_params = [[survey_response], active_phase]
        allow(Export::Xlsx::InputSheetGenerator).to receive(:new).and_return(Export::Xlsx::InputSheetGenerator.new(*expected_params))
        do_request
        expect(Export::Xlsx::InputSheetGenerator).to have_received(:new).with(*expected_params)
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
                'Cat;Dog',
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
