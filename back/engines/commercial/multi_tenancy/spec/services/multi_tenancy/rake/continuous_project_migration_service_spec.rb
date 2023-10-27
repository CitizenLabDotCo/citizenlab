# frozen_string_literal: true

require 'rails_helper'

RSpec.describe MultiTenancy::Rake::ContinuousProjectMigrationService do
  subject(:service) { described_class.new }

  shared_examples 'project_settings' do
    let_it_be(:continuous_project_attributes) { project.attributes.symbolize_keys.clone }

    it 'should list number of projects & successful migrations' do
      expect(service.stats).to eq({ projects: 1, success: 1, errors: [] })
    end

    it 'changes the project type' do
      expect(project.reload.process_type).to eq 'timeline'
    end

    it 'creates a single open ended phase for the project' do
      expect(project.phases.count).to eq 1
      expect(project.phases.first.end_at).to be_nil

      # TODO: Check title with all locales is created here
    end

    it 'copies all project settings to the phase' do
      phase = project.phases.first
      expect(phase.attributes.symbolize_keys).to include({
        participation_method: continuous_project_attributes[:participation_method],
        allow_anonymous_participation: continuous_project_attributes[:allow_anonymous_participation],
        campaigns_settings: { 'project_phase_started' => true },
        document_annotation_embed_url: continuous_project_attributes[:document_annotation_embed_url],
        ideas_order: continuous_project_attributes[:ideas_order],
        input_term: continuous_project_attributes[:input_term],
        poll_anonymous: continuous_project_attributes[:poll_anonymous],
        presentation_mode: continuous_project_attributes[:presentation_mode],
        survey_embed_url: continuous_project_attributes[:survey_embed_url],
        survey_service: continuous_project_attributes[:survey_service],
        commenting_enabled: continuous_project_attributes[:commenting_enabled],
        posting_enabled: continuous_project_attributes[:posting_enabled],
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
        voting_min_total: continuous_project_attributes[:voting_min_total],
        voting_term_singular_multiloc: continuous_project_attributes[:voting_term_singular_multiloc],
        voting_term_plural_multiloc: continuous_project_attributes[:voting_term_plural_multiloc]
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
        posting_enabled: true,
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
        voting_min_total: 0,
        voting_term_singular_multiloc: {},
        voting_term_plural_multiloc: {}
      })
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

      it 'should list number of projects with no success' do
        expect(service.stats).to eq({ projects: 1, success: 0, errors: [] })
      end

      it 'should not change the project type' do
        expect(project.reload.process_type).to eq 'continuous'
      end
    end

    context 'with persistence' do
      before do
        service.migrate(true)
      end

      context 'ideation projects' do
        let_it_be(:project) { create(:continuous_project) }
        let_it_be(:ideas) { create_list(:idea, 3, project: project) }
        let_it_be(:permission) { create(:permission, :by_users, action: 'commenting_idea', permission_scope: project) }

        include_examples 'project_settings'
        include_examples 'ideas'
        include_examples 'permissions'
      end

      context 'voting' do
        let_it_be(:project) { create(:continuous_budgeting_project) }
        let_it_be(:ideas) { create_list(:idea, 2, project: project) }
        let_it_be(:permission) { create(:permission, :by_everyone_confirmed_email, action: 'voting', permission_scope: project) }

        include_examples 'project_settings'
        include_examples 'ideas'
        include_examples 'permissions'
      end

      context 'poll' do
        let_it_be(:project) { create(:continuous_poll_project) }
        let_it_be(:permission) { create(:permission, :by_admins_moderators, action: 'taking_poll', permission_scope: project) }

        include_examples 'project_settings'
        include_examples 'permissions'
      end

      context 'native survey' do
        let_it_be(:project) { create(:continuous_native_survey_project) }
        let_it_be(:ideas) { create_list(:native_survey_response, 2, project: project) }
        let_it_be(:permission) { create(:permission, :by_everyone, action: 'posting_idea', permission_scope: project) }

        include_examples 'project_settings'
        include_examples 'ideas'
        include_examples 'permissions'

        it 'add the creation phase to each idea' do
          phase = project.phases.first
          project.ideas.each do |idea|
            expect(idea.reload.creation_phase).to eq phase
          end
        end
      end

      context 'survey' do
        let_it_be(:project) { create(:continuous_survey_project) }
        let_it_be(:permission) { create(:permission, :by_users, action: 'taking_survey', permission_scope: project) }

        include_examples 'project_settings'
        include_examples 'permissions'
      end

      context 'document_annotation' do
        let_it_be(:project) { create(:continuous_document_annotation_project) }
        let_it_be(:permission) { create(:permission, :by_users, action: 'annotating_document', permission_scope: project) }

        include_examples 'project_settings'
        include_examples 'permissions'
      end

      context 'volunteering' do
        let_it_be(:project) { create(:continuous_volunteering_project) }
        include_examples 'project_settings'
      end

      context 'information' do
        let_it_be(:project) { create(:continuous_project, participation_method: 'information') }
        include_examples 'project_settings'
      end
    end
  end
end
