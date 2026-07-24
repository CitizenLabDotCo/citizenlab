# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

def phase_params(spec)
  spec.parameter :project_id, 'The id of the project this phase belongs to', scope: :phase
  spec.parameter :title_multiloc, 'The title of the phase in multiple locales', scope: :phase
  spec.parameter :description_multiloc, 'The description of the phase in multiple languages. Supports basic HTML.', scope: :phase
  spec.parameter :participation_method, "The participation method of the project, either #{Phase::PARTICIPATION_METHODS.join(',')}. Some changes are not allowed when there are inputs.", scope: :phase
  spec.parameter :submission_enabled, 'Can citizens post ideas in this phase?', scope: :phase
  spec.parameter :commenting_enabled, 'Can citizens post comment in this phase?', scope: :phase
  spec.parameter :reacting_enabled, 'Can citizens react in this phase?', scope: :phase
  spec.parameter :reacting_like_method, "How does liking work? Either #{Phase::REACTING_METHODS.join(',')}", scope: :phase
  spec.parameter :reacting_like_limited_max, 'Number of likes a citizen can perform in this phase, only if the reacting_like_method is limited', scope: :phase
  spec.parameter :reacting_dislike_enabled, 'Can citizens react in this phase?', scope: :phase
  spec.parameter :reacting_dislike_method, "How does disliking work? Either #{Phase::REACTING_METHODS.join(',')}", scope: :phase
  spec.parameter :reacting_dislike_limited_max, 'Number of dislikes a citizen can perform in this phase, only if the reacting_dislike_method is limited', scope: :phase
  spec.parameter :allow_anonymous_participation, 'Only for ideation and budgeting phases. Allow users to post inputs and comments anonymously.', scope: :phase
  spec.parameter :presentation_mode, "Describes the presentation of the project's items (i.e. ideas), either #{Phase::PRESENTATION_MODES.join(',')}.", scope: :phase
  spec.parameter :available_views, "The available views for the phase, an array of #{Phase::PRESENTATION_MODES.join(',')}.", scope: :phase
  spec.parameter :survey_embed_url, 'The identifier for the survey from the external API, if participation_method is set to survey', scope: :phase
  spec.parameter :survey_service, "The name of the service of the survey. Either #{Surveys::SurveyPhase::SURVEY_SERVICES.join(',')}", scope: :phase
  spec.parameter :voting_method, "Either #{Phase::VOTING_METHODS.join(',')}", scope: :phase
  spec.parameter :voting_min_total, 'The minimum value a basket can have.', scope: :phase
  spec.parameter :voting_max_total, 'The maximal value a basket can have during voting', scope: :phase
  spec.parameter :voting_max_votes_per_idea, 'The maximum amount of votes that can be assigned on the same idea.', scope: :phase
  spec.parameter :voting_filtering_enabled, 'Enable filtering of votes during voting.', scope: :phase
  spec.parameter :manual_voters_amount, 'The number of voters from collected offline votes.', scope: :phase
  spec.parameter :vote_term, "The term used to describe the concept of a vote (noun). One of #{Phase::VOTE_TERMS.join(', ')}. Defaults to 'vote'.", scope: :phase
  spec.parameter :start_at, 'The start date of the phase', scope: :phase
  spec.parameter :end_at, 'The end date of the phase', scope: :phase
  spec.parameter :poll_anonymous, "Are users associated with their answer? Only applies if participation_method is 'poll'. Can't be changed after first answer.", scope: :phase
  spec.parameter :ideas_order, 'The default order of ideas.', scope: :phase
  spec.parameter :prescreening_mode, "The pre-screening mode. Either nil, 'all', or 'flagged_only'.", scope: :phase
  spec.parameter :similarity_enabled, 'Enable searching for similar inputs during submission.', scope: :phase
  spec.parameter :similarity_threshold_title, 'The similarity threshold for the title of the input.', scope: :phase
  spec.parameter :similarity_threshold_body, 'The similarity threshold for the body of the input.', scope: :phase
end

resource 'Phases' do
  explanation 'Timeline projects consist of multiple phases through which ideas can transit.'

  before { header 'Content-Type', 'application/json' }

  patch 'web_api/v1/phases/:id' do
    phase_params(self)

    ValidationErrorHelper.new.error_fields(self, Phase)
    response_field :project, "Array containing objects with signature {error: 'is_not_timeline_project'}", scope: :errors
    response_field :base, "Array containing objects with signature {error: 'has_other_overlapping_phases'}", scope: :errors

    let(:json_response) { json_parse(response_body) }
    let(:project) { create(:project) }
    let(:phase) { create(:phase, project: project) }
    let(:id) { phase.id }
    let(:description_multiloc) { phase.description_multiloc }
    let(:participation_method) { phase.participation_method }
    let(:submission_enabled) { false }
    let(:commenting_enabled) { false }
    let(:reacting_enabled) { true }
    let(:reacting_like_method) { 'limited' }
    let(:reacting_like_limited_max) { 6 }
    let(:presentation_mode) { 'map' }
    let(:available_views) { %w[card map] }
    let(:allow_anonymous_participation) { true }
    let(:prescreening_mode) { 'all' }
    let(:similarity_enabled) { true }
    let(:similarity_threshold_body) { 0.2 }

    context 'when admin' do
      before do
        admin_header_token
        SettingsService.new.activate_feature!('prescreening_ideation')
      end

      example_request 'Update a phase' do
        assert_status 200
        expect(response_data[:attributes]).to include(
          description_multiloc: description_multiloc.symbolize_keys,
          participation_method: participation_method,
          submission_enabled: submission_enabled,
          commenting_enabled: commenting_enabled,
          reacting_enabled: reacting_enabled,
          reacting_like_method: reacting_like_method,
          reacting_like_limited_max: reacting_like_limited_max,
          presentation_mode: presentation_mode,
          available_views: available_views,
          allow_anonymous_participation: allow_anonymous_participation,
          prescreening_mode: prescreening_mode,
          similarity_enabled: similarity_enabled,
          similarity_threshold_body: similarity_threshold_body
        )
      end

      context 'when description_multiloc contains images' do
        let(:description_multiloc) { { 'en' => html_with_base64_image } }

        it_behaves_like 'updates record with text images',
          model_class: Phase,
          field: :description_multiloc
      end

      describe 'proposals phase' do
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

        context 'when the feed view is requested' do
          let(:available_views) { %w[card feed] }

          example_request '[error] Update a proposals phase to offer the feed view' do
            assert_status 422
            expect(json_response_body.dig(:errors, :available_views)).to be_present
          end
        end
      end

      describe 'voting phase' do
        let(:phase) { create(:budgeting_phase) }
        let(:participation_method) { 'voting' }
        let(:voting_min_total) { 3 }
        let(:voting_max_total) { 15 }
        let(:voting_max_votes_per_idea) { 1 } # Should ignore this
        let(:voting_filtering_enabled) { true }
        let(:vote_term) { 'token' }

        example_request 'Update a voting phase' do
          assert_status 200
          expect(json_response.dig(:data, :attributes, :voting_min_total)).to eq 3
          expect(json_response.dig(:data, :attributes, :voting_max_total)).to eq 15
          expect(json_response.dig(:data, :attributes, :voting_min_selected_options)).to eq 1
          expect(json_response.dig(:data, :attributes, :voting_max_votes_per_idea)).to be_nil
          expect(json_response.dig(:data, :attributes, :voting_filtering_enabled)).to be true
          expect(json_response.dig(:data, :attributes, :vote_term)).to eq 'token'
        end

        describe 'with offline voters' do
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

      context 'when the phase has inputs' do
        before { create(:idea_status_proposed) }

        let(:ideas) { create_list(:idea, 2, project: project) }
        let(:phase) { create(:phase, project: project, participation_method: 'ideation', ideas: ideas) }
        let(:participation_method) { 'information' }

        example '[error] Cannot change participation method when phase has inputs' do
          do_request
          assert_status 422
          expect(json_response).to eq(
            { errors: { participation_method: [{ error: 'has_inputs' }] } }
          )
        end
      end
    end
  end
end
