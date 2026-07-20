# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

def phase_params(spec)
  spec.parameter :title_multiloc, 'The title of the phase in multiple locales', scope: :phase, required: true
  spec.parameter :description_multiloc, 'The description of the phase in multiple languages. Supports basic HTML.', scope: :phase
  spec.parameter :participation_method, "The participation method of the project, either #{Phase::PARTICIPATION_METHODS.join(',')}. Defaults to ideation.", scope: :phase
  spec.parameter :submission_enabled, 'Can citizens submit inputs in this phase? Defaults to true', scope: :phase
  spec.parameter :commenting_enabled, 'Can citizens post comment in this phase? Defaults to true', scope: :phase
  spec.parameter :reacting_enabled, 'Can citizens react in this phase? Defaults to true', scope: :phase
  spec.parameter :reacting_like_method, "How does reacting work? Either #{Phase::REACTING_METHODS.join(',')}. Defaults to unlimited", scope: :phase
  spec.parameter :reacting_like_limited_max, 'Number of likes a citizen can perform in this phase, only if the reacting_like_method is limited. Defaults to 10', scope: :phase
  spec.parameter :reacting_dislike_enabled, 'Can citizens dislikes in this phase? Defaults to true', scope: :phase
  spec.parameter :reacting_dislike_method, "How does disliking work? Either #{Phase::REACTING_METHODS.join(',')}. Defaults to unlimited", scope: :phase
  spec.parameter :reacting_dislike_limited_max, 'Number of dislikes a citizen can perform in this phase, only if the reacting_dislike_method is limited. Defaults to 10', scope: :phase
  spec.parameter :allow_anonymous_participation, 'Only for ideation and budgeting phases. Allow users to post inputs and comments anonymously. Defaults to false', scope: :phase
  spec.parameter :presentation_mode, "Describes the presentation of the project's items (i.e. ideas), either #{Phase::PRESENTATION_MODES.join(',')}.", scope: :phase
  spec.parameter :survey_embed_url, 'The identifier for the survey from the external API, if participation_method is set to survey', scope: :phase
  spec.parameter :survey_service, "The name of the service of the survey. Either #{Surveys::SurveyPhase::SURVEY_SERVICES.join(',')}", scope: :phase
  spec.parameter :voting_method, "Either #{Phase::VOTING_METHODS.join(',')}. Required when the participation method is voting.", scope: :phase
  spec.parameter :voting_min_total, 'The minimum value a basket can have.', scope: :phase
  spec.parameter :voting_max_total, 'The maximal value a basket can have during voting. Required when the voting method is budgeting.', scope: :phase
  spec.parameter :voting_max_votes_per_idea, 'The maximum amount of votes that can be assigned on the same idea.', scope: :phase
  spec.parameter :voting_filtering_enabled, 'Enable filtering of votes during voting. Defaults to false.', scope: :phase
  spec.parameter :voting_min_selected_options, 'The minimum number of different ideas that must be voted for.', scope: :phase
  spec.parameter :start_at, 'The start date of the phase', scope: :phase, required: true
  spec.parameter :end_at, 'The end date of the phase', scope: :phase, required: true
  spec.parameter :poll_anonymous, "Are users associated with their answer? Defaults to false. Only applies if participation_method is 'poll'", scope: :phase
  spec.parameter :ideas_order, 'The default order of ideas.', scope: :phase
  spec.parameter :input_term, "The term used to describe an input. One of #{Phase::INPUT_TERMS.join(', ')}. Defaults to 'idea'.", scope: :phase
  spec.parameter :vote_term, "The term used to describe the concept of a vote (noun). One of #{Phase::VOTE_TERMS.join(', ')}. Defaults to 'vote'.", scope: :phase
  spec.parameter :native_survey_title_multiloc, 'A title for the native survey.', scope: :phase
  spec.parameter :native_survey_button_multiloc, 'Text for native survey call to action button.', scope: :phase
  spec.parameter :prescreening_mode, "The pre-screening mode. Either null, 'all', or 'flagged_only'.", scope: :phase
  spec.parameter :similarity_enabled, 'Enable searching for similar inputs during submission. Defaults to false.', scope: :phase
  spec.parameter :similarity_threshold_title, 'The similarity threshold for the title of the input. Defaults to 0.3', scope: :phase
  spec.parameter :similarity_threshold_body, 'The similarity threshold for the body of the input. Defaults to 0.4', scope: :phase
  spec.parameter :placement_type, "Whether the phase is on the timeline or standalone (a detached phase, e.g. an extra survey). Either #{Phase::PLACEMENT_TYPES.join(', ')}. Defaults to 'on_timeline'. Can only be set on creation.", scope: :phase
end

resource 'Phases' do
  explanation 'Timeline projects consist of multiple phases through which ideas can transit.'

  before { header 'Content-Type', 'application/json' }

  post 'web_api/v1/projects/:project_id/phases' do
    phase_params(self)

    ValidationErrorHelper.new.error_fields(self, Phase)
    response_field :project, "Array containing objects with signature {error: 'is_not_timeline_project'}", scope: :errors
    response_field :base, "Array containing objects with signature {error: 'has_other_overlapping_phases'}", scope: :errors

    let(:json_response) { json_parse(response_body) }
    let(:project) { create(:project) }
    let(:project_id) { project.id }
    let!(:phases) { create_list(:phase_sequence, 2, project: project) }
    let(:phase) { build(:phase) }
    let(:title_multiloc) { phase.title_multiloc }
    let(:description_multiloc) { phase.description_multiloc }
    let(:participation_method) { phase.participation_method }
    let(:start_at) { phase.start_at }
    let(:end_at) { phase.end_at }
    let(:vote_term) { 'token' }

    context 'when admin' do
      before do
        admin_header_token
        SettingsService.new.activate_feature!('prescreening_ideation')
      end

      example_request 'Create a phase for a project' do
        assert_status 201
        phase_in_db = Phase.find(json_response.dig(:data, :id))

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
        expect(json_response.dig(:data, :attributes, :vote_term)).to eq 'token'
        expect(json_response.dig(:data, :attributes, :start_at)).to eq phase_in_db.start_at.as_json
        expect(json_response.dig(:data, :attributes, :end_at)).to eq phase_in_db.end_at.as_json
        expect(json_response.dig(:data, :attributes, :previous_phase_end_at_updated)).to be false
        expect(json_response.dig(:data, :relationships, :project, :data, :id)).to eq project_id
      end

      describe 'proposals phase' do
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

      context 'standalone (detached) phase' do
        # Deliberately reuse an existing timeline phase's window: standalone phases run
        # in parallel and are not subject to the no-overlap rule.
        let(:timeline_phase) { phases.first }
        let(:placement_type) { 'standalone' }
        let(:start_at) { timeline_phase.start_at }
        let(:end_at) { timeline_phase.end_at }

        example_request 'Create a standalone phase that overlaps the timeline' do
          assert_status 201
          expect(json_response.dig(:data, :attributes, :placement_type)).to eq 'standalone'
          expect(json_response.dig(:data, :attributes, :start_at)).to eq timeline_phase.start_at.as_json
          expect(json_response.dig(:data, :attributes, :end_at)).to eq timeline_phase.end_at.as_json
          expect(Phase.find(json_response.dig(:data, :id)).placement_type).to eq 'standalone'
        end
      end

      context 'with a blank end date' do
        let(:start_at) { phases.last.end_at + 5.days }
        let(:end_at) { nil }

        example_request 'Create a phase for a project with an open end date' do
          assert_status 201
          expect(json_response.dig(:data, :attributes, :end_at)).to be_nil
        end
      end

      context 'when the previous phase has no end date' do
        let(:new_phase_start) do
          last_phase = phases.last
          start = last_phase.end_at + 1.day
          last_phase.update!(end_at: nil)
          start
        end
        let(:start_at) { new_phase_start }
        let(:end_at) { new_phase_start + 5.days }

        example 'Create a phase on a project with an open ended last phase' do
          do_request
          assert_status 201
          expect(json_response.dig(:data, :attributes, :previous_phase_end_at_updated)).to be true
          expect(project.phases.last.reload.end_at).not_to be_nil
        end
      end

      describe 'voting phases' do
        let(:participation_method) { 'voting' }
        let(:voting_filtering_enabled) { true }

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
            expect(response_data.dig(:attributes, :voting_filtering_enabled)).to be true
          end
        end

        context 'multiple voting' do
          let(:voting_method) { 'multiple_voting' }
          let(:voting_max_total) { 10 }
          let(:voting_max_votes_per_idea) { 5 }
          let(:vote_term) { 'point' }

          example_request 'Create a voting (multiple voting) phase' do
            assert_status 201
            expect(response_data.dig(:attributes, :participation_method)).to eq 'voting'
            expect(response_data.dig(:attributes, :voting_method)).to eq 'multiple_voting'
            expect(response_data.dig(:attributes, :voting_max_total)).to eq 10
            expect(response_data.dig(:attributes, :voting_min_total)).to eq 0
            expect(response_data.dig(:attributes, :voting_min_selected_options)).to eq 1
            expect(response_data.dig(:attributes, :voting_max_votes_per_idea)).to eq 5
            expect(response_data.dig(:attributes, :vote_term)).to eq 'point'
            expect(response_data.dig(:attributes, :ideas_order)).to eq 'random'
            expect(response_data.dig(:attributes, :voting_filtering_enabled)).to be true
          end
        end

        context 'single voting' do
          let(:voting_method) { 'single_voting' }

          example_request 'Create a voting (single voting) phase' do
            assert_status 201
            expect(response_data.dig(:attributes, :participation_method)).to eq 'voting'
            expect(response_data.dig(:attributes, :voting_method)).to eq 'single_voting'
            expect(response_data.dig(:attributes, :voting_max_total)).to be_nil
            expect(response_data.dig(:attributes, :voting_min_selected_options)).to eq 1
            expect(response_data.dig(:attributes, :voting_min_total)).to eq 0
            expect(response_data.dig(:attributes, :voting_max_votes_per_idea)).to eq 1
            expect(response_data.dig(:attributes, :ideas_order)).to eq 'random'
            expect(response_data.dig(:attributes, :voting_filtering_enabled)).to be true
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
          phase_in_db = Phase.find(json_response.dig(:data, :id))

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
        let(:input_term) { 'idea' }

        example_request 'Create a common ground phase', document: false do
          assert_status 201
          expect(response_data.dig(:attributes, :participation_method)).to eq('common_ground')

          phase = Phase.find(response_data[:id])
          expect(phase.participation_method).to eq('common_ground')
          expect(phase.reacting_enabled).to be(true)
          expect(phase.reacting_dislike_enabled).to be(true)
          expect(phase.input_term).to eq('contribution')
        end
      end

      context 'with an invalid phase' do
        let(:start_at) { nil }

        example '[error] Create an invalid phase', document: false do
          do_request
          assert_status 422
          expect(json_response).to include_response_error(:start_at, 'blank')
        end
      end

      context 'with an overlapping phase' do
        before do
          project.phases.each(&:destroy!)
          create(:phase, project: project, start_at: Time.now - 2.days, end_at: Time.now + 2.days)
        end

        let(:start_at) { Time.now }
        let(:end_at) { Time.now + 4.days }

        example_request '[error] Create an overlapping phase' do
          assert_status 422
          expect(json_response).to include_response_error(:base, 'has_other_overlapping_phases')
        end
      end

      context 'external survey' do
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

      context 'with another voting phase using the same method' do
        before { create(:budgeting_phase, project: project, start_at: '2000-01-01', end_at: '2000-01-05') }

        let(:participation_method) { 'voting' }
        let(:voting_method) { 'budgeting' }
        let(:voting_max_total) { 300 }

        example 'Create multiple voting phases with the same voting method', document: false do
          do_request
          assert_status 201
        end
      end

      context 'with a text image in the description' do
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
  end
end
