# frozen_string_literal: true

require 'rails_helper'

describe ParticipationContextService do
  let(:service) { described_class.new }

  describe 'posting_idea_disabled_reason_for_project' do
    let(:project) { create(:project_with_current_phase, current_phase_attrs: { with_permissions: true }) }
    let(:permission) do
      service
        .get_participation_context(project).permissions
        .find_by(action: 'posting_idea')
    end

    it 'returns nil when posting is allowed' do
      user = create(:user)
      group = create(:group)
      group.add_member(user).save!

      permission.update!(permitted_by: 'groups', groups: [group])
      expect(service.posting_idea_disabled_reason_for_project(project, user)).to be_nil
    end

    it 'returns `not_signed_in` when user needs to be signed in' do
      permission.update!(permitted_by: 'users')
      expect(service.posting_idea_disabled_reason_for_project(project, nil)).to eq 'not_signed_in'
    end

    it 'returns `not_permitted` when posting is not permitted' do
      permission.update!(permitted_by: 'groups', groups: create_list(:group, 2))
      expect(service.posting_idea_disabled_reason_for_project(project, create(:user))).to eq 'not_permitted'
    end

    it 'returns nil when everyone can post and the user is not signed in' do
      permission.update! permitted_by: 'everyone'
      expect(service.posting_idea_disabled_reason_for_project(project, nil)).to be_nil
    end
  end

  describe 'commenting_idea_disabled_reason_for_project' do
    let(:user) { create(:user) }
    let(:project) { create(:project_with_current_phase, current_phase_attrs: { with_permissions: true }) }
    let(:permission) do
      service
        .get_participation_context(project).permissions
        .find_by(action: 'commenting_idea')
    end

    context 'for timeline projects' do
      it 'returns `not_signed_in` when user needs to be signed in' do
        permission.update!(permitted_by: 'users')
        expect(service.commenting_idea_disabled_reason_for_project(project, nil)).to eq 'not_signed_in'

        idea = create(:idea, project: project, phases: [project.phases[2]])
        expect(service.commenting_disabled_reason_for_idea(idea, nil)).to eq 'not_signed_in'
      end

      it 'returns `not_permitted` commenting is not permitted for the user' do
        permission.update!(permitted_by: 'groups', groups: create_list(:group, 2))
        expect(service.commenting_idea_disabled_reason_for_project(project, user)).to eq 'not_permitted'

        idea = create(:idea, project: project, phases: [project.phases[2]])
        expect(service.commenting_disabled_reason_for_idea(idea, user)).to eq 'not_permitted'
      end
    end

    context 'for continuous project' do
      it "returns 'not_permitted' when commenting is disabled in a continuous project" do
        project = create(:continuous_project, with_permissions: true)
        permission = project.permissions.find_by(action: 'commenting_idea')
        permission.update!(
          permitted_by: 'groups',
          group_ids: create_list(:group, 2).map(&:id)
        )
        expect(service.commenting_idea_disabled_reason_for_project(project, create(:user))).to eq 'not_permitted'
        idea = create(:idea, project: project)
        expect(service.commenting_disabled_reason_for_idea(idea, user)).to eq 'not_permitted'
      end
    end
  end

  describe 'idea_voting_disabled_reason_for' do
    let(:user) { create(:user) }
    let(:reasons) { ParticipationContextService::VOTING_DISABLED_REASONS }

    context 'timeline project' do
      let(:project) { create(:project_with_current_phase, current_phase_attrs: { with_permissions: true }) }
      let(:idea) { create(:idea, project: project, phases: [project.phases[2]]) }
      let(:permission) do
        service.get_participation_context(project).permissions
          .find_by(action: 'voting_idea')
      end

      it 'returns `not_signed_in` when user needs to be signed in' do
        permission.update!(permitted_by: 'users')
        expect(service.idea_voting_disabled_reason_for(project, nil, mode: 'up')).to eq 'not_signed_in'
        expect(service.idea_voting_disabled_reason_for(project, nil, mode: 'down')).to eq 'not_signed_in'
        expect(service.idea_voting_disabled_reason_for(idea, nil, mode: 'up')).to eq 'not_signed_in'
        expect(service.idea_voting_disabled_reason_for(idea, nil, mode: 'down')).to eq 'not_signed_in'
      end

      it "returns 'not_permitted' if it's in the current phase and voting is not permitted" do
        permission.update!(permitted_by: 'groups', groups: create_list(:group, 2))
        expect(service.idea_voting_disabled_reason_for(project, user, mode: 'up')).to eq 'not_permitted'
        expect(service.idea_voting_disabled_reason_for(project, user, mode: 'down')).to eq 'not_permitted'
        expect(service.idea_voting_disabled_reason_for(idea, user, mode: 'up')).to eq 'not_permitted'
        expect(service.idea_voting_disabled_reason_for(idea, user, mode: 'down')).to eq 'not_permitted'
      end
    end

    context 'continuous project' do
      context 'for a normal user' do
        let(:user) { create(:user) }

        it "returns 'not_permitted' if voting is not permitted" do
          project = create(:continuous_project, with_permissions: true)
          idea = create(:idea, project: project)
          permission = project.permissions.find_by(action: 'voting_idea')
          permission.update!(
            permitted_by: 'groups',
            group_ids: create_list(:group, 2).map(&:id)
          )
          expect(service.idea_voting_disabled_reason_for(project, user, mode: 'up')).to eq 'not_permitted'
          expect(service.idea_voting_disabled_reason_for(project, user, mode: 'down')).to eq 'not_permitted'
          expect(service.idea_voting_disabled_reason_for(idea, user, mode: 'up')).to eq 'not_permitted'
          expect(service.idea_voting_disabled_reason_for(idea, user, mode: 'down')).to eq 'not_permitted'
        end
      end

      context 'for an unauthenticated visitor' do
        let(:user) { nil }

        it "returns 'not_signed_in' if voting is not permitted and verification is not involved" do
          project = create(:continuous_project, with_permissions: true)
          idea = create(:idea, project: project)
          permission = project.permissions.find_by(action: 'voting_idea')
          permission.update!(
            permitted_by: 'groups',
            group_ids: create_list(:group, 2).map(&:id)
          )
          expect(service.idea_voting_disabled_reason_for(project, user, mode: 'up')).to eq 'not_signed_in'
          expect(service.idea_voting_disabled_reason_for(project, user, mode: 'down')).to eq 'not_signed_in'
          expect(service.idea_voting_disabled_reason_for(idea, user, mode: 'up')).to eq 'not_signed_in'
          expect(service.idea_voting_disabled_reason_for(idea, user, mode: 'down')).to eq 'not_signed_in'
        end
      end
    end
  end

  describe 'cancelling_votes_disabled_reasons' do
    let(:user) { create(:user) }
    let(:reasons) { ParticipationContextService::VOTING_DISABLED_REASONS }

    context 'timeline project' do
      let(:project) do
        create(:project_with_current_phase, current_phase_attrs: { with_permissions: true, permissions_config: { voting_idea: false } })
      end
      let(:idea) { create(:idea, project: project, phases: [project.phases[2]]) }

      it "returns `not_signed_in` if it's in the current phase and user needs to be signed in" do
        service.get_participation_context(project).permissions.find_by(action: 'voting_idea')
          .update!(permitted_by: 'users')
        expect(service.cancelling_votes_disabled_reason_for_idea(idea, nil)).to eq 'not_signed_in'
      end

      it "returns 'not_permitted' if it's in the current phase and voting is not permitted" do
        expect(service.cancelling_votes_disabled_reason_for_idea(idea, idea.author)).to eq 'not_permitted'
      end
    end

    context 'continuous project' do
      it "returns 'not_permitted' if voting is not permitted" do
        project = create(:continuous_project, with_permissions: true)
        idea = create(:idea, project: project)
        permission = project.permissions.find_by(action: 'voting_idea')
        permission.update!(
          permitted_by: 'groups',
          group_ids: create_list(:group, 2).map(&:id)
        )
        expect(service.cancelling_votes_disabled_reason_for_idea(idea, idea.author)).to eq 'not_permitted'
      end
    end
  end

  describe 'taking_survey_disabled_reason' do
    it 'returns nil when taking the survey is allowed' do
      project = create(:continuous_survey_project, with_permissions: true)
      permission = service.get_participation_context(project).permissions.find_by(action: 'taking_survey')
      groups = create_list(:group, 2, projects: [project])
      permission.update!(permitted_by: 'groups', group_ids: groups.map(&:id))
      user = create(:user)
      group = groups.first
      group.add_member user
      group.save!
      expect(service.taking_survey_disabled_reason_for_project(project, user)).to be_nil
    end

    it 'returns `not_signed_in` when user needs to be signed in' do
      project = create(:continuous_survey_project, with_permissions: true)
      permission = service.get_participation_context(project).permissions.find_by(action: 'taking_survey')
      permission.update!(permitted_by: 'users')
      expect(service.taking_survey_disabled_reason_for_project(project, nil)).to eq 'not_signed_in'
    end

    it 'returns `not_permitted` when taking the survey is not permitted' do
      project = create(:continuous_survey_project, with_permissions: true)
      permission = service.get_participation_context(project).permissions.find_by(action: 'taking_survey')
      permission.update!(
        permitted_by: 'groups',
        group_ids: create_list(:group, 2).map(&:id)
      )
      expect(service.taking_survey_disabled_reason_for_project(project, create(:user))).to eq 'not_permitted'
    end
  end

  describe 'taking_poll_disabled_reason' do
    it 'returns nil when taking the poll is allowed' do
      project = create(:continuous_poll_project, with_permissions: true)
      permission = Permission.find_by(action: 'taking_poll', permission_scope: project)
      group = create(:group, projects: [project])
      permission.update!(permitted_by: 'groups', groups: [group])
      user = create(:user)
      group.add_member(user)
      group.save!
      expect(service.taking_poll_disabled_reason_for_project(project, user)).to be_nil
    end

    it 'returns `not_signed_in` when user needs to be signed in' do
      project = create(:continuous_poll_project, with_permissions: true)
      permission = service.get_participation_context(project).permissions.find_by(action: 'taking_poll')
      permission.update!(permitted_by: 'users')
      expect(service.taking_poll_disabled_reason_for_project(project, nil)).to eq 'not_signed_in'
    end

    it 'return `not_permitted` when taking the poll is not permitted' do
      project = create(:continuous_poll_project, with_permissions: true)
      permission = service.get_participation_context(project).permissions.find_by(action: 'taking_poll')
      permission.update!(permitted_by: 'admins_moderators')
      expect(service.taking_poll_disabled_reason_for_project(project, create(:user))).to eq 'not_permitted'
    end
  end

  describe 'budgeting_disabled_reasons' do
    context 'for timeline projects' do
      it 'returns `not_signed_in` when user needs to be signed in' do
        project = create(
          :project_with_current_phase,
          current_phase_attrs: { with_permissions: true, participation_method: 'budgeting', max_budget: 10_000 }
        )
        idea = create(:idea, project: project, phases: [project.phases[2]])
        permission = service.get_participation_context(project).permissions.find_by(action: 'budgeting')
        permission.update!(permitted_by: 'users')
        expect(service.budgeting_disabled_reason_for_idea(idea, nil)).to eq 'not_signed_in'
      end

      it 'returns `not_permitted` when the idea is in the current phase and budgeting is not permitted' do
        project = create(
          :project_with_current_phase,
          current_phase_attrs: { with_permissions: true, participation_method: 'budgeting', max_budget: 10_000 }
        )
        idea = create(:idea, project: project, phases: [project.phases[2]])
        permission = service.get_participation_context(project).permissions.find_by(action: 'budgeting')
        permission.update!(
          permitted_by: 'groups',
          group_ids: create_list(:group, 2).map(&:id)
        )
        expect(service.budgeting_disabled_reason_for_idea(idea, create(:user))).to eq 'not_permitted'
      end

      it "returns 'project_inactive' when the timeline is over" do
        project = create(:project_with_past_phases)
        idea = create(:idea, project: project, phases: [project.phases[2]])
        expect(service.budgeting_disabled_reason_for_idea(idea, create(:user))).to eq 'project_inactive'
      end
    end

    context 'continuous project' do
      it "returns 'not_permitted' when budgeting is disabled in a continuous project" do
        project = create(:continuous_budgeting_project, with_permissions: true)
        permission = project.permissions.find_by(action: 'budgeting')
        permission.update!(
          permitted_by: 'groups',
          group_ids: create_list(:group, 2).map(&:id)
        )
        idea = create(:idea, project: project)
        expect(service.budgeting_disabled_reason_for_idea(idea, create(:user))).to eq 'not_permitted'
      end

      it "returns 'project_inactive' when the project is archived" do
        project = create(:continuous_budgeting_project, with_permissions: true, admin_publication_attributes: { publication_status: 'archived' })
        idea = create(:idea, project: project)
        expect(service.budgeting_disabled_reason_for_idea(idea, create(:user))).to eq 'project_inactive'
      end
    end
  end

  describe 'future_posting_enabled_phase' do
    it 'returns the first upcoming phase that has posting enabled' do
      project = create(
        :project_with_current_phase,
        phases_config: {
          sequence: 'xcxxxxxy',
          x: { permissions_config: { posting_idea: false } },
          y: { permissions_config: { posting_idea: true } },
          c: { permissions_config: { posting_idea: false } }
        }
      )
      expect(service.future_posting_idea_enabled_phase(project, create(:user))).to eq project.phases.order(:start_at)[7]
    end

    it 'returns nil if no next phase has posting enabled' do
      project = create(
        :project_with_current_phase,
        phases_config: {
          sequence: 'xcyyy',
          y: { permissions_config: { posting_idea: false } }
        }
      )
      expect(service.future_posting_idea_enabled_phase(project, create(:user))).to be_nil
    end
  end

  describe 'future_voting_enabled_phase' do
    it 'returns the first upcoming phase that has voting enabled' do
      project = create(
        :project_with_current_phase,
        phases_config: {
          sequence: 'xcxxxxxy',
          x: { permissions_config: { voting_idea: false } },
          y: { permissions_config: { voting_idea: true } },
          c: { permissions_config: { voting_idea: false } }
        }
      )
      expect(service.future_upvoting_idea_enabled_phase(project, create(:user))).to eq project.phases.order(:start_at)[7]
      expect(service.future_downvoting_idea_enabled_phase(project, create(:user))).to eq project.phases.order(:start_at)[7]
    end

    it 'returns nil if no next phase has voting enabled' do
      project = create(
        :project_with_current_phase,
        phases_config: {
          sequence: 'xcyyy',
          y: { permissions_config: { voting_idea: false } }
        }
      )
      expect(service.future_upvoting_idea_enabled_phase(project, create(:user))).to be_nil
      expect(service.future_downvoting_idea_enabled_phase(project, create(:user))).to be_nil
    end
  end

  describe 'future_commenting_enabled_phase' do
    it 'returns the first upcoming phase that has commenting enabled' do
      project = create(
        :project_with_current_phase,
        phases_config: {
          sequence: 'xcxxxxxy',
          x: { permissions_config: { commenting_idea: false } },
          y: { permissions_config: { commenting_idea: true } },
          c: { permissions_config: { commenting_idea: false } }
        }
      )
      expect(service.future_commenting_idea_enabled_phase(project, create(:user))).to eq project.phases.order(:start_at)[7]
    end

    it 'returns nil if no next phase has commenting enabled' do
      project = create(
        :project_with_current_phase,
        phases_config: {
          sequence: 'xcyyy',
          y: { permissions_config: { commenting_idea: false } }
        }
      )
      expect(service.future_commenting_idea_enabled_phase(project, create(:user))).to be_nil
    end
  end
end
