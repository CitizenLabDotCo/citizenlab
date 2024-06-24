# frozen_string_literal: true

require 'rails_helper'

describe Permissions::IdeaPermissionsService do
  let(:service) { described_class.new }

  describe '"commenting_idea" denied_reason' do
    let(:user) { create(:user) }

    it 'returns `user_not_verified` when not permitted and a permitted group requires verification' do
      project = create(:project_with_current_phase, current_phase_attrs: { with_permissions: true })
      permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'commenting_idea')
      verified_members = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
      permission.update!(permitted_by: 'groups', group_ids: [create(:group).id, verified_members.id])
      idea = create(:idea, project: project, phases: [project.phases[2]])
      expect(service.denied_reason_for_action('commenting_idea', user, idea)).to eq 'user_not_verified'
    end
  end

  describe '"reacting_idea" denied_reason_for...' do
    context 'for a normal user' do
      let(:user) { create(:user) }

      it "returns 'user_not_verified' if it's in the current phase and reacting is not permitted and a permitted group requires verification" do
        project = create(:project_with_current_phase, current_phase_attrs: { with_permissions: true })
        idea = create(:idea, project: project, phases: [project.phases[2]])
        permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'reacting_idea')
        verified_members = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
        permission.update!(permitted_by: 'groups', groups: [create(:group), verified_members])
        expect(service.denied_reason_for_action('reacting_idea', user, idea, reaction_mode: 'up')).to eq 'user_not_verified'
        expect(service.denied_reason_for_action('reacting_idea', user, idea, reaction_mode: 'down')).to eq 'user_not_verified'
      end
    end

    context 'for an unauthenticated visitor' do
      let(:user) { nil }

      it "returns 'user_not_signed_in' if reacting is not permitted and a permitted group requires verification" do
        project = create(:single_phase_ideation_project, phase_attrs: { with_permissions: true })
        idea = create(:idea, project: project, phases: project.phases)
        permission = project.phases.first.permissions.find_by(action: 'reacting_idea')
        group = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
        permission.update!(permitted_by: 'groups', groups: [create(:group), group])
        expect(service.denied_reason_for_action('reacting_idea', user, idea, reaction_mode: 'up')).to eq 'user_not_signed_in'
        expect(service.denied_reason_for_action('reacting_idea', user, idea, reaction_mode: 'down')).to eq 'user_not_signed_in'
      end
    end
  end

  describe 'voting_disabled_reasons' do
    it 'returns `user_not_verified` when the idea is in the current phase and budgeting is not permitted and a permitted group requires verification' do
      project = create(:project_with_current_phase,
        current_phase_attrs: { with_permissions: true, participation_method: 'voting', voting_method: 'budgeting', voting_max_total: 10_000 })
      idea = create(:idea, project: project, phases: [project.phases[2]])
      permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'voting')
      verified_members = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
      permission.update!(permitted_by: 'groups', groups: [create(:group), verified_members])
      expect(service.denied_reason_for_action('voting', create(:user), idea)).to eq 'user_not_verified'
    end
  end
end
