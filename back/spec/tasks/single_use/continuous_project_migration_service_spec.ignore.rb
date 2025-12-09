# frozen_string_literal: true

require 'rails_helper'
require_relative '../../../lib/tasks/single_use/services/continuous_project_migration_service'

RSpec.configure do |config|
  config.before(:suite) do
    I18n.load_path += Dir[Rails.root.join('engines/commercial/multi_tenancy/spec/fixtures/locales/*.yml')]
  end
end

RSpec.describe Tasks::SingleUse::Services::ContinuousProjectMigrationService do
  subject(:service) { described_class.new }

  shared_examples 'project_settings' do
    let_it_be(:continuous_project_attributes) { project.attributes.symbolize_keys.clone }

    it 'returns valid stats' do
      expect(service.stats[:projects]).to eq 1
      expect(service.stats[:success]).to eq 1
      expect(service.stats[:errors]).to eq []
      expect(service.stats[:records_updated]).to be > 0
    end

    it 'changes the project type' do
      expect(project.reload.process_type).to eq 'timeline'
    end

    it 'creates a single open ended phase for the project' do
      expect(project.phases.count).to eq 1
      expect(project.phases.first.end_at).to be_nil
      expect(project.phases.first.start_at).to eq project.created_at.to_date
    end

    it 'copies all project settings to the phase' do
      phase = project.phases.first
      expect(phase.attributes.symbolize_keys).to include({
        participation_method: continuous_project_attributes[:participation_method],
        allow_anonymous_participation: continuous_project_attributes[:allow_anonymous_participation],
        document_annotation_embed_url: continuous_project_attributes[:document_annotation_embed_url],
        ideas_order: continuous_project_attributes[:ideas_order],
        input_term: continuous_project_attributes[:input_term],
        poll_anonymous: continuous_project_attributes[:poll_anonymous],
        presentation_mode: continuous_project_attributes[:presentation_mode],
        survey_embed_url: continuous_project_attributes[:survey_embed_url],
        survey_service: continuous_project_attributes[:survey_service],
        commenting_enabled: continuous_project_attributes[:commenting_enabled],
        submission_enabled: continuous_project_attributes[:submission_enabled],
        posting_method: continuous_project_attributes[:posting_method],
        posting_limited_max: continuous_project_attributes[:posting_limited_max],
        reacting_enabled: continuous_project_attributes[:reacting_enabled],
        reacting_like_method: continuous_project_attributes[:reacting_like_method],
        reacting_like_limited_max: continuous_project_attributes[:reacting_like_limited_max],
        reacting_dislike_enabled: continuous_project_attributes[:reacting_dislike_enabled],
        reacting_dislike_method: continuous_project_attributes[:reacting_dislike_method],
        reacting_dislike_limited_max: continuous_project_attributes[:reacting_dislike_limited_max],
        voting_method: continuous_project_attributes[:voting_method],
        voting_max_votes_per_idea: continuous_project_attributes[:voting_max_votes_per_idea],
        voting_max_total: continuous_project_attributes[:voting_max_total],
        voting_min_total: continuous_project_attributes[:voting_min_total]
      })
    end

    it 'resets the project to defaults' do
      expect(project.reload.attributes.symbolize_keys).to include({
        participation_method: 'ideation',
        allow_anonymous_participation: false,
        document_annotation_embed_url: nil,
        ideas_order: nil,
        input_term: 'idea',
        poll_anonymous: false,
        presentation_mode: 'card',
        survey_embed_url: nil,
        survey_service: nil,
        commenting_enabled: true,
        submission_enabled: true,
        posting_method: 'unlimited',
        posting_limited_max: 1,
        reacting_enabled: true,
        reacting_like_method: 'unlimited',
        reacting_like_limited_max: 10,
        reacting_dislike_enabled: true,
        reacting_dislike_method: 'unlimited',
        reacting_dislike_limited_max: 10,
        voting_method: nil,
        voting_max_votes_per_idea: nil,
        voting_max_total: 10,
        voting_min_total: 0
      })
    end

    it "logs a 'created' action for the newly created phase" do
      expect(LogActivityJob).to have_been_enqueued.with(
        project.phases.first,
        'created',
        nil,
        project.phases.first.created_at.to_i,
        { payload: { migrated_from_continuous: true }, project_id: project.id }
      )
    end
  end

  shared_examples 'ideas' do
    it 'adds ideas to the phase' do
      phase = project.phases.first
      project.ideas.each do |idea|
        expect(idea.phases.count).to eq 1
        expect(idea.phases.first).to eq phase
      end
      expect(phase.ideas_count).to be > 0
      expect(phase.ideas_count).to eq project.ideas_count
    end
  end

  shared_examples 'permissions' do
    it 'moves permissions from project to the phase' do
      phase = project.phases.first
      expect(permission.reload.permission_scope_id).to eq phase.id
      expect(permission.reload.permission_scope_type).to eq 'Phase'
      expect(Permission.where(permission_scope_type: 'Project')).to eq []
    end
  end

  describe '#migrate' do
    context 'without persistence' do
      let_it_be(:project) { create(:continuous_project) }

      before { service.migrate(false) }

      it 'lists number of projects with no success' do
        expect(service.stats).to eq({ projects: 1, success: 0, records_updated: 0, errors: [] })
      end

      it 'does not change the project type' do
        expect(project.reload.process_type).to eq 'continuous'
      end
    end

    context 'with persistence' do
      before do
        ActiveJob::Base.queue_adapter.enqueued_jobs.clear
        service.migrate(true)
      end

      context 'ideation projects' do
        let_it_be(:project) { create(:continuous_project) }
        let_it_be(:ideas) { create_list(:idea, 3, project: project) }
        let_it_be(:permission) { create(:permission, :by_users, action: 'commenting_idea', permission_scope: project) }
        let_it_be(:analysis) { create(:analysis, project: project) }
        let_it_be(:custom_form) { create(:custom_form, participation_context: project) }

        include_examples 'project_settings'
        include_examples 'ideas'
        include_examples 'permissions'

        it 'creates an ideation phase title for all locales' do
          expect(project.phases.first.title_multiloc).to eq({ 'en' => 'Collect input', 'fr-FR' => 'Collect input - FR', 'nl-NL' => 'Collect input - NL' })
        end

        it 'does not move any analyses from the phase to the project' do
          expect(analysis.reload.project).to eq project
          expect(analysis.reload.phase).to be_nil
        end

        it 'does not move custom forms to the phase' do
          expect(custom_form.reload.participation_context_id).to eq project.id
          expect(custom_form.reload.participation_context_type).to eq 'Project'
        end
      end

      context 'voting' do
        let_it_be(:project) { create(:continuous_budgeting_project) }
        let_it_be(:ideas) { create_list(:idea, 2, project: project, budget: 400) }
        let_it_be(:permission) { create(:permission, :by_everyone_confirmed_email, action: 'voting', permission_scope: project) }
        let_it_be(:baskets) { create_list(:basket, 3, participation_context: project) }
        let_it_be(:baskets_idea1) { create(:baskets_idea, idea: ideas.first, basket: baskets.first) }
        let_it_be(:baskets_idea2) { create(:baskets_idea, idea: ideas.last, basket: baskets.last) }
        let_it_be(:basket_submitted_notification) { create(:notification, type: 'Notifications::VotingBasketSubmitted', project: project, basket: baskets.first) }
        let_it_be(:basket_not_submitted_notification) { create(:notification, type: 'Notifications::VotingBasketNotSubmitted', project: project, basket: baskets.first) }

        include_examples 'project_settings'
        include_examples 'ideas'
        include_examples 'permissions'

        it 'creates a voting phase title for all locales' do
          expect(project.phases.first.title_multiloc).to eq({ 'en' => 'Voting', 'fr-FR' => 'Voting - FR', 'nl-NL' => 'Voting - NL' })
        end

        it 'changes the participation context of a basket' do
          phase = project.phases.first
          baskets.each do |basket|
            expect(basket.reload.participation_context_id).to eq phase.id
            expect(basket.reload.participation_context_type).to eq 'Phase'
            expect(Basket.where(participation_context_type: 'Project')).to eq []
          end
        end

        it 'updates the basket count on the phase, project & ideas phase' do
          expect(project.reload.baskets_count).to eq 3
          expect(project.reload.votes_count).to eq 800
          expect(project.phases.first.baskets_count).to eq 3
          expect(project.phases.first.votes_count).to eq 800
          expect(IdeasPhase.all.pluck(:baskets_count)).to match [1, 1]
          expect(IdeasPhase.all.pluck(:votes_count)).to match [400, 400]
        end

        it 'updates basket notifications with the phase' do
          expect(basket_submitted_notification.reload.phase).to eq project.phases.first
          expect(basket_not_submitted_notification.reload.phase).to eq project.phases.first
        end
      end

      context 'poll' do
        let_it_be(:project) { create(:continuous_poll_project) }
        let_it_be(:permission) { create(:permission, :by_admins_moderators, action: 'taking_poll', permission_scope: project) }
        let_it_be(:poll_questions) { create_list(:poll_question, 2, participation_context: project) }
        let_it_be(:poll_responses) { create_list(:poll_response, 3, participation_context: project) }

        include_examples 'project_settings'
        include_examples 'permissions'

        it 'creates a poll phase title for all locales' do
          expect(project.phases.first.title_multiloc).to eq({ 'en' => 'Poll', 'fr-FR' => 'Poll - FR', 'nl-NL' => 'Poll - NL' })
        end

        it 'changes the participation context of a poll question' do
          phase = project.phases.first
          poll_questions.each do |poll_question|
            expect(poll_question.reload.participation_context_id).to eq phase.id
            expect(poll_question.reload.participation_context_type).to eq 'Phase'
            expect(Polls::Question.where(participation_context_type: 'Project')).to eq []
          end
        end

        it 'changes the participation context of a poll response' do
          phase = project.phases.first
          poll_responses.each do |poll_response|
            expect(poll_response.reload.participation_context_id).to eq phase.id
            expect(poll_response.reload.participation_context_type).to eq 'Phase'
            expect(Polls::Response.where(participation_context_type: 'Project')).to eq []
          end
        end
      end

      context 'native survey' do
        let_it_be(:project) { create(:continuous_native_survey_project) }
        let_it_be(:ideas) { create_list(:native_survey_response, 2, project: project) }
        let_it_be(:permission) { create(:permission, :by_everyone, action: 'posting_idea', permission_scope: project) }
        let_it_be(:analysis) { create(:analysis, project: project) }
        let_it_be(:custom_form) { create(:custom_form, participation_context: project) }

        include_examples 'project_settings'
        include_examples 'ideas'
        include_examples 'permissions'

        it 'creates a survey phase title for all locales' do
          expect(project.phases.first.title_multiloc).to eq({ 'en' => 'Survey', 'fr-FR' => 'Survey - FR', 'nl-NL' => 'Survey - NL' })
        end

        it 'add the creation phase to each idea' do
          phase = project.phases.first
          project.ideas.each do |idea|
            expect(idea.reload.creation_phase).to eq phase
          end
        end

        it 'moves any analyses from the phase to the project' do
          expect(analysis.reload.project).to be_nil
          expect(analysis.reload.phase).to eq project.phases.first
        end

        it 'moves custom forms to the phase' do
          expect(custom_form.reload.participation_context_id).to eq project.phases.first.id
          expect(custom_form.reload.participation_context_type).to eq 'Phase'
        end
      end

      context 'survey' do
        let_it_be(:project) { create(:continuous_survey_project) }
        let_it_be(:permission) { create(:permission, :by_users, action: 'taking_survey', permission_scope: project) }
        let_it_be(:survey_responses) { create_list(:survey_response, 3, participation_context: project) }

        include_examples 'project_settings'
        include_examples 'permissions'

        it 'creates a survey phase title for all locales' do
          expect(project.phases.first.title_multiloc).to eq({ 'en' => 'Survey', 'fr-FR' => 'Survey - FR', 'nl-NL' => 'Survey - NL' })
        end

        it 'changes the participation context of a survey response' do
          phase = project.phases.first
          survey_responses.each do |survey_response|
            expect(survey_response.reload.participation_context_id).to eq phase.id
            expect(survey_response.reload.participation_context_type).to eq 'Phase'
            expect(Surveys::Response.where(participation_context_type: 'Project')).to eq []
          end
        end
      end

      context 'document_annotation' do
        let_it_be(:project) { create(:continuous_document_annotation_project) }
        let_it_be(:permission) { create(:permission, :by_users, action: 'annotating_document', permission_scope: project) }

        it 'creates a document_anotation phase title for all locales' do
          expect(project.phases.first.title_multiloc).to eq({ 'en' => 'Document feedback', 'fr-FR' => 'Document feedback - FR', 'nl-NL' => 'Document feedback - NL' })
        end

        include_examples 'project_settings'
        include_examples 'permissions'
      end

      context 'volunteering' do
        let_it_be(:project) { create(:continuous_volunteering_project) }
        let_it_be(:volunteering_causes) { create_list(:cause, 3, participation_context: project) }

        include_examples 'project_settings'

        it 'creates a volunteering title for all locales' do
          expect(project.phases.first.title_multiloc).to eq({ 'en' => 'Find volunteers', 'fr-FR' => 'Find volunteers - FR', 'nl-NL' => 'Find volunteers - NL' })
        end

        it 'changes the participation context of a volunteering cause' do
          phase = project.phases.first
          volunteering_causes.each do |volunteering_cause|
            expect(volunteering_cause.reload.participation_context_id).to eq phase.id
            expect(volunteering_cause.reload.participation_context_type).to eq 'Phase'
            expect(Volunteering::Cause.where(participation_context_type: 'Project')).to eq []
          end
        end
      end

      context 'information' do
        let_it_be(:project) { create(:continuous_project, participation_method: 'information') }
        include_examples 'project_settings'

        it 'creates an information title for all locales' do
          expect(project.phases.first.title_multiloc).to eq({ 'en' => 'Information', 'fr-FR' => 'Information - FR', 'nl-NL' => 'Information - NL' })
        end
      end
    end
  end

  describe '#fix_survey_custom_forms' do
    let(:ideation_project) { create(:project_with_active_ideation_phase) }
    let(:survey_project) { create(:project_with_active_native_survey_phase) }
    let!(:ideation_custom_form) { create(:custom_form, participation_context: ideation_project) }
    let!(:survey_custom_form) { create(:custom_form, participation_context: survey_project) }

    before do
      service.fix_survey_custom_forms
    end

    it 'updates native survey forms and does not update ideation forms' do
      expect(ideation_custom_form.reload.participation_context_id).to eq ideation_project.id
      expect(ideation_custom_form.reload.participation_context_type).to eq 'Project'
      expect(survey_custom_form.reload.participation_context_id).to eq survey_project.phases.first.id
      expect(survey_custom_form.reload.participation_context_type).to eq 'Phase'
    end
  end
end
