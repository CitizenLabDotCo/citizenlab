# frozen_string_literal: true

require 'rails_helper'

describe Permissions::BasePermissionsService do
  let(:service) { described_class.new }

  describe 'denied_reason_for_permission' do
    let(:groups) { [create(:group), create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])] }
    let(:group_permission) { create(:permission, permitted_by: 'groups', groups: groups) }

    context 'when not signed in' do
      let(:user) { nil }

      it { expect(service.send(:user_denied_reason, group_permission, user)).to eq 'not_signed_in' }
    end

    context 'when user is admin' do
      let(:admin) { create(:admin) }

      it { expect(service.send(:user_denied_reason, group_permission, admin)).to be_nil }
    end

    context 'when verified resident' do
      let(:user) { create(:user, verified: true) }

      it { expect(service.send(:user_denied_reason, group_permission, user)).to be_nil }
    end

    context 'when unverified resident' do
      let(:user) { create(:user, verified: false) }

      it { expect(service.send(:user_denied_reason, group_permission, user)).to eq 'not_verified' }
    end

    context 'when unverified resident and no verification group' do
      let(:groups) { [create(:group)] }
      let(:user) { create(:user, verified: false) }

      it { expect(service.send(:user_denied_reason, group_permission, user)).to eq 'not_in_group' }
    end

    context 'when unverified resident, belonging to the other group' do
      let(:user) { create(:user, verified: false, manual_groups: [groups.first]) }

      it { expect(service.send(:user_denied_reason, group_permission, user)).to be_nil }
    end
  end

  describe '"posting_idea" denied_reason_for_project' do
    it 'returns nil when a permitted group requires verification for a verified user' do
      project = create(:single_phase_ideation_project, phase_attrs: { with_permissions: true })
      permission = project.phases.first.permissions.find_by(action: 'posting_idea')
      verified_members = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
      permission.update!(permitted_by: 'groups', groups: [create(:group), verified_members])
      expect(service.denied_reason_for_project('posting_idea', create(:user, verified: true), project)).to be_nil
    end

    it 'returns `not_verified` when not permitted and a permitted group requires verification, while the user is not verified' do
      project = create(:single_phase_ideation_project, phase_attrs: { with_permissions: true })
      permission = project.phases.first.permissions.find_by(action: 'posting_idea')
      verified_members = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
      permission.update!(permitted_by: 'groups', groups: [create(:group), verified_members])
      expect(service.denied_reason_for_project('posting_idea', create(:user, verified: false), project)).to eq 'not_verified'
    end

    it 'returns `not_signed_in` when not permitted and a permitted group requires verification, while the user is not signed in' do
      project = create(:single_phase_ideation_project, phase_attrs: { with_permissions: true })
      permission = project.phases.first.permissions.find_by(action: 'posting_idea')
      verified_members = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
      permission.update!(permitted_by: 'groups', groups: [create(:group), verified_members])
      expect(service.denied_reason_for_project('posting_idea', nil, project)).to eq 'not_signed_in'
    end

    it 'returns `not_in_group` when not permitted and a permitted group requires verification, while the user is verified' do
      project = create(:single_phase_ideation_project, phase_attrs: { with_permissions: true })
      permission = project.phases.first.permissions.find_by(action: 'posting_idea')
      birthyear = create(:custom_field_birthyear)
      verified_members = create(
        :smart_group,
        rules: [
          { ruleType: 'verified', predicate: 'is_verified' },
          { value: 2002, ruleType: 'custom_field_number', predicate: 'is_smaller_than_or_equal', customFieldId: birthyear.id }
        ]
      )
      permission.update!(permitted_by: 'groups', groups: [create(:group), verified_members])
      expect(service.denied_reason_for_project('posting_idea', create(:user, verified: true, birthyear: 2008), project)).to eq 'not_in_group'
    end

    it 'returns `not_permitted` when only permitted to admins but a group requires verification' do
      project = create(:single_phase_ideation_project, phase_attrs: { with_permissions: true })
      permission = project.phases.first.permissions.find_by(action: 'posting_idea')
      verified_members = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
      permission.update!(permitted_by: 'admins_moderators', groups: [create(:group), verified_members])
      expect(service.denied_reason_for_project('posting_idea', create(:user), project)).to eq 'not_permitted'
    end
  end

  describe 'commenting_disabled_reason' do
    let(:user) { create(:user) }

    it 'returns `not_verified` when not permitted and a permitted group requires verification' do
      project = create(:project_with_current_phase, current_phase_attrs: { with_permissions: true })
      permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'commenting_idea')
      verified_members = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
      permission.update!(permitted_by: 'groups', group_ids: [create(:group).id, verified_members.id])
      expect(service.denied_reason_for_project('commenting_idea', user, project)).to eq 'not_verified'
      idea = create(:idea, project: project, phases: [project.phases[2]])
      expect(service.denied_reason_for_idea( 'commenting_idea', user, idea)).to eq 'not_verified'
    end
  end

  describe '"reacting_idea" denied_reason_for...' do
    context 'for a normal user' do
      let(:user) { create(:user) }

      it "returns 'not_verified' if it's in the current phase and reacting is not permitted and a permitted group requires verification" do
        project = create(:project_with_current_phase, current_phase_attrs: { with_permissions: true })
        idea = create(:idea, project: project, phases: [project.phases[2]])
        permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'reacting_idea')
        verified_members = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
        permission.update!(permitted_by: 'groups', groups: [create(:group), verified_members])
        expect(service.denied_reason_for_project('reacting_idea', user, project, reaction_mode: 'up')).to eq 'not_verified'
        expect(service.denied_reason_for_project('reacting_idea', user, project, reaction_mode: 'down')).to eq 'not_verified'
        expect(service.denied_reason_for_idea( 'reacting_idea', user, idea, reaction_mode: 'up')).to eq 'not_verified'
        expect(service.denied_reason_for_idea( 'reacting_idea', user, idea, reaction_mode: 'down')).to eq 'not_verified'
      end
    end

    context 'for an unauthenticated visitor' do
      let(:user) { nil }

      it "returns 'not_signed_in' if reacting is not permitted and a permitted group requires verification" do
        project = create(:single_phase_ideation_project, phase_attrs: { with_permissions: true })
        idea = create(:idea, project: project, phases: project.phases)
        permission = project.phases.first.permissions.find_by(action: 'reacting_idea')
        group = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
        permission.update!(permitted_by: 'groups', groups: [create(:group), group])
        expect(service.denied_reason_for_project('reacting_idea', user, project, reaction_mode: 'up')).to eq 'not_signed_in'
        expect(service.denied_reason_for_project('reacting_idea', user, project, reaction_mode: 'down')).to eq 'not_signed_in'
        expect(service.denied_reason_for_idea( 'reacting_idea', user, idea, reaction_mode: 'up')).to eq 'not_signed_in'
        expect(service.denied_reason_for_idea( 'reacting_idea', user, idea, reaction_mode: 'down')).to eq 'not_signed_in'
      end
    end
  end

  describe 'annotating_document_disabled_reason' do
    it 'returns `not_verified` when annotating the document not permitted and permitted group requires verification' do
      project = create(:single_phase_document_annotation_project, phase_attrs: { with_permissions: true })
      permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'annotating_document')
      verified_members = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
      permission.update!(permitted_by: 'groups', groups: [create(:group), verified_members])
      expect(service.denied_reason_for_project('annotating_document', create(:user), project)).to eq 'not_verified'
    end
  end

  describe 'taking_survey_disabled_reason' do
    it 'returns `not_verified` when taking the survey is not permitted and a permitted group requires verification' do
      project = create(:single_phase_typeform_survey_project, phase_attrs: { with_permissions: true })
      permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'taking_survey')
      verified_members = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
      permission.update!(permitted_by: 'groups', groups: [create(:group), verified_members])
      expect(service.denied_reason_for_project('taking_survey', create(:user), project)).to eq 'not_verified'
    end
  end

  describe 'taking_poll_disabled_reason' do
    it 'return `not_verified` when taking the poll is not permitted and a permitted group requires verification' do
      project = create(:single_phase_poll_project, phase_attrs: { with_permissions: true })
      permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'taking_poll')
      verified_members = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
      permission.update!(permitted_by: 'groups', groups: [create(:group), verified_members])
      expect(service.denied_reason_for_project('taking_poll', create(:user), project)).to eq 'not_verified'
    end
  end

  describe 'voting_disabled_reasons' do
    it 'returns `not_verified` when the idea is in the current phase and budgeting is not permitted and a permitted group requires verification' do
      project = create(:project_with_current_phase,
        current_phase_attrs: { with_permissions: true, participation_method: 'voting', voting_method: 'budgeting', voting_max_total: 10_000 })
      idea = create(:idea, project: project, phases: [project.phases[2]])
      permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'voting')
      verified_members = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
      permission.update!(permitted_by: 'groups', groups: [create(:group), verified_members])
      expect(service.denied_reason_for_idea('voting', create(:user), idea)).to eq 'not_verified'
    end
  end
end
