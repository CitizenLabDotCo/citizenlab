require 'rails_helper'

describe Permissions::IdeaPermissionsService do
  let(:service) { described_class.new(idea, user) }
  let(:user) { create(:user) }
  let(:idea) { create(:idea, project: project, phases: [project.phases[2]]) }
  let(:project) { create(:project_with_current_phase, current_phase_attrs: current_phase_attrs) }
  let(:current_phase_attrs) { {} }

  describe '"commenting_idea" denied_reason' do
    let(:current_phase_attrs) { { with_permissions: true } }

    it 'returns `user_not_verified` when not permitted and a permitted group requires verification' do
      permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'commenting_idea')
      verified_members = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
      permission.update!(permitted_by: 'users', group_ids: [create(:group).id, verified_members.id])
      expect(service.denied_reason_for_action('commenting_idea')).to eq 'user_not_verified'
    end
  end

  describe '"reacting_idea" denied_reason_for...' do
    context 'when in the current phase and reacting is not permitted' do
      let(:current_phase_attrs) { { with_permissions: true, reacting_dislike_enabled: true } }

      it "returns 'user_not_verified' if permitted group requires verification" do
        permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'reacting_idea')
        verified_members = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
        permission.update!(permitted_by: 'users', groups: [create(:group), verified_members])
        expect(service.denied_reason_for_reaction_mode('up')).to eq 'user_not_verified'
        expect(service.denied_reason_for_reaction_mode('down')).to eq 'user_not_verified'
      end
    end

    context 'for an unauthenticated visitor' do
      let(:user) { nil }
      let(:project) { create(:single_phase_ideation_project, phase_attrs: { with_permissions: true, reacting_dislike_enabled: true }) }
      let(:idea) { create(:idea, project: project, phases: project.phases) }

      it "returns 'user_not_signed_in' if reacting is not permitted and a permitted group requires verification" do
        permission = project.phases.first.permissions.find_by(action: 'reacting_idea')
        group = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
        permission.update!(permitted_by: 'users', groups: [create(:group), group])
        expect(service.denied_reason_for_reaction_mode('up')).to eq 'user_not_signed_in'
        expect(service.denied_reason_for_reaction_mode('down')).to eq 'user_not_signed_in'
      end
    end
  end

  describe 'voting_disabled_reasons' do
    let(:current_phase_attrs) { { with_permissions: true, participation_method: 'voting', voting_method: 'budgeting', voting_max_total: 10_000 } }

    it 'returns `user_not_verified` when the idea is in the current phase and budgeting is not permitted and a permitted group requires verification' do
      permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'voting')
      verified_members = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
      permission.update!(permitted_by: 'users', groups: [create(:group), verified_members])
      expect(service.denied_reason_for_action('voting')).to eq 'user_not_verified'
    end
  end
end
