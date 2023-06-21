# frozen_string_literal: true

require 'rails_helper'

describe ParticipationContextService do
  let(:service) { described_class.new }

  describe 'posting_disabled_reason' do
    it 'returns nil when a permitted group requires verification for a verified user' do
      project = create(:continuous_project, with_permissions: true)
      permission = project.permissions.find_by(action: 'posting_idea')
      verified_members = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
      permission.update!(permitted_by: 'groups', groups: [create(:group), verified_members])
      expect(service.posting_idea_disabled_reason_for_project(project, create(:user, verified: true))).to be_nil
    end

    it 'returns `not_verified` when not permitted and a permitted group requires verification, while the user is not verified' do
      project = create(:continuous_project, with_permissions: true)
      permission = project.permissions.find_by(action: 'posting_idea')
      verified_members = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
      permission.update!(permitted_by: 'groups', groups: [create(:group), verified_members])
      expect(service.posting_idea_disabled_reason_for_project(project, create(:user, verified: false))).to eq 'not_verified'
    end

    it 'returns `not_signed_in` when not permitted and a permitted group requires verification, while the user is not signed in' do
      project = create(:continuous_project, with_permissions: true)
      permission = project.permissions.find_by(action: 'posting_idea')
      verified_members = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
      permission.update!(permitted_by: 'groups', groups: [create(:group), verified_members])
      expect(service.posting_idea_disabled_reason_for_project(project, nil)).to eq 'not_signed_in'
    end

    it 'returns `not_in_group` when not permitted and a permitted group requires verification, while the user is verified' do
      project = create(:continuous_project, with_permissions: true)
      permission = project.permissions.find_by(action: 'posting_idea')
      birthyear = create(:custom_field_birthyear)
      verified_members = create(
        :smart_group,
        rules: [
          { ruleType: 'verified', predicate: 'is_verified' },
          { value: 2002, ruleType: 'custom_field_number', predicate: 'is_smaller_than_or_equal', customFieldId: birthyear.id }
        ]
      )
      permission.update!(permitted_by: 'groups', groups: [create(:group), verified_members])
      expect(service.posting_idea_disabled_reason_for_project(project, create(:user, verified: true, birthyear: 2008))).to eq 'not_in_group'
    end

    it 'returns `not_permitted` when only permitted to admins but a group requires verification' do
      project = create(:continuous_project, with_permissions: true)
      permission = project.permissions.find_by(action: 'posting_idea')
      verified_members = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
      permission.update!(permitted_by: 'admins_moderators', groups: [create(:group), verified_members])
      expect(service.posting_idea_disabled_reason_for_project(project, create(:user))).to eq 'not_permitted'
    end
  end

  describe 'commenting_disabled_reason' do
    let(:user) { create(:user) }

    context 'for timeline projects' do
      it 'returns `not_verified` when not permitted and a permitted group requires verification' do
        project = create(:project_with_current_phase, current_phase_attrs: { with_permissions: true })
        permission = service.get_participation_context(project).permissions.find_by(action: 'commenting_idea')
        verified_members = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
        permission.update!(permitted_by: 'groups', group_ids: [create(:group).id, verified_members.id])
        expect(service.commenting_idea_disabled_reason_for_project(project, user)).to eq 'not_verified'
        idea = create(:idea, project: project, phases: [project.phases[2]])
        expect(service.commenting_disabled_reason_for_idea(idea, user)).to eq 'not_verified'
      end
    end

    context 'for continuous project' do
      it "returns 'not_verified' when not permitted and a permitted group requires verification in a continuous project" do
        project = create(:continuous_project, with_permissions: true)
        permission = project.permissions.find_by(action: 'commenting_idea')
        verified_members = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
        permission.update!(permitted_by: 'groups', groups: [create(:group), verified_members])
        expect(service.commenting_idea_disabled_reason_for_project(project, create(:user))).to eq 'not_verified'
        idea = create(:idea, project: project)
        expect(service.commenting_disabled_reason_for_idea(idea, user)).to eq 'not_verified'
      end
    end
  end

  describe 'idea_reacting_disabled_reason_for' do
    context 'for a normal user' do
      let(:user) { create(:user) }

      context 'timeline project' do
        it "returns 'not_verified' if it's in the current phase and reacting is not permitted and a permitted group requires verification" do
          project = create(:project_with_current_phase, current_phase_attrs: { with_permissions: true })
          idea = create(:idea, project: project, phases: [project.phases[2]])
          permission = service.get_participation_context(project).permissions.find_by(action: 'reacting_idea')
          verified_members = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
          permission.update!(permitted_by: 'groups', groups: [create(:group), verified_members])
          expect(service.idea_reacting_disabled_reason_for(project, user, mode: 'up')).to eq 'not_verified'
          expect(service.idea_reacting_disabled_reason_for(project, user, mode: 'down')).to eq 'not_verified'
          expect(service.idea_reacting_disabled_reason_for(idea, user, mode: 'up')).to eq 'not_verified'
          expect(service.idea_reacting_disabled_reason_for(idea, user, mode: 'down')).to eq 'not_verified'
        end
      end

      context 'continuous project' do
        it "returns 'not_verified' if reacting is not permitted and a permitted group requires verification" do
          project = create(:continuous_project, with_permissions: true)
          idea = create(:idea, project: project)
          permission = project.permissions.find_by(action: 'reacting_idea')
          verified_members = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
          permission.update!(permitted_by: 'groups', groups: [create(:group), verified_members])
          expect(service.idea_reacting_disabled_reason_for(project, user, mode: 'up')).to eq 'not_verified'
          expect(service.idea_reacting_disabled_reason_for(project, user, mode: 'down')).to eq 'not_verified'
          expect(service.idea_reacting_disabled_reason_for(idea, user, mode: 'up')).to eq 'not_verified'
          expect(service.idea_reacting_disabled_reason_for(idea, user, mode: 'down')).to eq 'not_verified'
        end
      end
    end

    context 'for an unauthenticated visitor' do
      let(:user) { nil }

      it "returns 'not_signed_in' if reacting is not permitted and a permitted group requires verification" do
        project = create(:continuous_project, with_permissions: true)
        idea = create(:idea, project: project)
        permission = project.permissions.find_by(action: 'reacting_idea')
        group = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
        permission.update!(permitted_by: 'groups', groups: [create(:group), group])
        expect(service.idea_reacting_disabled_reason_for(project, user, mode: 'up')).to eq 'not_signed_in'
        expect(service.idea_reacting_disabled_reason_for(project, user, mode: 'down')).to eq 'not_signed_in'
        expect(service.idea_reacting_disabled_reason_for(idea, user, mode: 'up')).to eq 'not_signed_in'
        expect(service.idea_reacting_disabled_reason_for(idea, user, mode: 'down')).to eq 'not_signed_in'
      end
    end
  end

  describe 'cancelling_reactions_disabled_reasons' do
    let(:user) { create(:user) }

    context 'timeline project' do
      it "returns 'not_verified' if it's in the current phase and reacting is not permitted and a permitted group requires verification" do
        project = create(:project_with_current_phase,
          current_phase_attrs: { permissions_config: { reacting_idea: false } })
        permission = TimelineService.new.current_phase(project).permissions.find_by(action: 'reacting_idea')
        verified_members = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
        permission.update!(permitted_by: 'groups', groups: [create(:group), verified_members])
        idea = create(:idea, project: project, phases: [project.phases[2]])
        expect(service.cancelling_reacting_disabled_reason_for_idea(idea, idea.author)).to eq 'not_verified'
      end
    end

    context 'continuous project' do
      it "returns 'not_verified' if reacting is not permitted and a permitted group requires verification" do
        project = create(:continuous_project, with_permissions: true)
        idea = create(:idea, project: project)
        permission = project.permissions.find_by(action: 'reacting_idea')
        verified_members = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
        permission.update!(permitted_by: 'groups', groups: [create(:group), verified_members])
        expect(service.cancelling_reacting_disabled_reason_for_idea(idea, idea.author)).to eq 'not_verified'
      end
    end
  end

  describe 'annotating_document_disabled_reason' do
    it 'returns `not_verified` when annotating the document not permitted and permitted group requires verification' do
      project = create(:continuous_document_annotation_project, with_permissions: true)
      permission = service.get_participation_context(project).permissions.find_by(action: 'annotating_document')
      verified_members = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
      permission.update!(permitted_by: 'groups', groups: [create(:group), verified_members])
      expect(service.annotating_document_disabled_reason_for_project(project, create(:user))).to eq 'not_verified'
    end
  end

  describe 'taking_survey_disabled_reason' do
    it 'returns `not_verified` when taking the survey is not permitted and a permitted group requires verification' do
      project = create(:continuous_survey_project, with_permissions: true)
      permission = service.get_participation_context(project).permissions.find_by(action: 'taking_survey')
      verified_members = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
      permission.update!(permitted_by: 'groups', groups: [create(:group), verified_members])
      expect(service.taking_survey_disabled_reason_for_project(project, create(:user))).to eq 'not_verified'
    end
  end

  describe 'taking_poll_disabled_reason' do
    it 'return `not_verified` when taking the poll is not permitted and a permitted group requires verification' do
      project = create(:continuous_poll_project, with_permissions: true)
      permission = service.get_participation_context(project).permissions.find_by(action: 'taking_poll')
      verified_members = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
      permission.update!(permitted_by: 'groups', groups: [create(:group), verified_members])
      expect(service.taking_poll_disabled_reason_for_project(project, create(:user))).to eq 'not_verified'
    end
  end

  describe 'voting_disabled_reasons' do
    context 'for timeline projects' do
      it 'returns `not_verified` when the idea is in the current phase and budgeting is not permitted and a permitted group requires verification' do
        project = create(:project_with_current_phase,
          current_phase_attrs: { with_permissions: true, participation_method: 'voting', voting_method: 'budgeting', voting_max_total: 10_000 })
        idea = create(:idea, project: project, phases: [project.phases[2]])
        permission = service.get_participation_context(project).permissions.find_by(action: 'voting')
        verified_members = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
        permission.update!(permitted_by: 'groups', groups: [create(:group), verified_members])
        expect(service.voting_disabled_reason_for_idea(idea, create(:user))).to eq 'not_verified'
      end
    end

    context 'continuous project' do
      it "returns 'not_verified' when budgeting is disabled in a continuous project and a permitted group requires verification" do
        project = create(:continuous_budgeting_project, with_permissions: true)
        permission = project.permissions.find_by(action: 'voting')
        verified_members = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
        permission.update!(permitted_by: 'groups', groups: [create(:group), verified_members])
        idea = create(:idea, project: project)
        expect(service.voting_disabled_reason_for_idea(idea, create(:user))).to eq 'not_verified'
      end
    end
  end
end
