require 'rails_helper'

describe Permissions::ProjectPermissionsService do
  let(:service) { described_class.new(project, user) }
  let(:user) { create(:user, verified: false) }
  let(:project) { create(:project_with_current_phase, current_phase_attrs: current_phase_attrs) }
  let(:current_phase_attrs) { {} }

  describe '"posting_idea" denied_reason_for_action' do
    let(:project) { create(:single_phase_ideation_project, phase_attrs: { with_permissions: true }) }

    context 'for a verified user' do
      let(:user) { create(:user, verified: true, birthyear: 2008) }

      it 'returns nil when a permitted group requires verification' do
        permission = project.phases.first.permissions.find_by(action: 'posting_idea')
        verified_members = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
        permission.update!(permitted_by: 'users', groups: [create(:group), verified_members])
        expect(service.denied_reason_for_action('posting_idea')).to be_nil
      end

      it 'returns `user_not_in_group` when not permitted and a permitted group requires verification' do
        permission = project.phases.first.permissions.find_by(action: 'posting_idea')
        birthyear = create(:custom_field_birthyear)
        verified_members = create(
          :smart_group,
          rules: [
            { ruleType: 'verified', predicate: 'is_verified' },
            { value: 2002, ruleType: 'custom_field_number', predicate: 'is_smaller_than_or_equal', customFieldId: birthyear.id }
          ]
        )
        permission.update!(permitted_by: 'users', groups: [create(:group), verified_members])
        expect(service.denied_reason_for_action('posting_idea')).to eq 'user_not_in_group'
      end
    end

    it 'returns `user_not_verified` when not permitted and a permitted group requires verification, while the user is not verified' do
      permission = project.phases.first.permissions.find_by(action: 'posting_idea')
      verified_members = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
      permission.update!(permitted_by: 'users', groups: [create(:group), verified_members])
      expect(service.denied_reason_for_action('posting_idea')).to eq 'user_not_verified'
    end

    context 'when the user is not signed in' do
      let(:user) { nil }

      it 'returns `user_not_signed_in` when not permitted and a permitted group requires verification' do
        permission = project.phases.first.permissions.find_by(action: 'posting_idea')
        verified_members = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
        permission.update!(permitted_by: 'users', groups: [create(:group), verified_members])
        expect(service.denied_reason_for_action('posting_idea')).to eq 'user_not_signed_in'
      end
    end

    it 'returns `user_not_permitted` when only permitted to admins but a group requires verification' do
      permission = project.phases.first.permissions.find_by(action: 'posting_idea')
      verified_members = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
      permission.update!(permitted_by: 'admins_moderators', groups: [create(:group), verified_members])
      expect(service.denied_reason_for_action('posting_idea')).to eq 'user_not_permitted'
    end
  end

  describe 'commenting_disabled_reason' do
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

      it "returns 'user_not_verified' if a permitted group requires verification" do
        create(:idea, project: project, phases: [project.phases[2]])
        permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'reacting_idea')
        verified_members = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
        permission.update!(permitted_by: 'users', groups: [create(:group), verified_members])
        expect(service.denied_reason_for_action('reacting_idea', reaction_mode: 'up')).to eq 'user_not_verified'
        expect(service.denied_reason_for_action('reacting_idea', reaction_mode: 'down')).to eq 'user_not_verified'
      end
    end

    context 'for an unauthenticated visitor' do
      let(:user) { nil }
      let(:project) { create(:single_phase_ideation_project, phase_attrs: { with_permissions: true, reacting_dislike_enabled: true }) }

      it "returns 'user_not_signed_in' if reacting is not permitted and a permitted group requires verification" do
        create(:idea, project: project, phases: project.phases)
        permission = project.phases.first.permissions.find_by(action: 'reacting_idea')
        group = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
        permission.update!(permitted_by: 'users', groups: [create(:group), group])
        expect(service.denied_reason_for_action('reacting_idea', reaction_mode: 'up')).to eq 'user_not_signed_in'
        expect(service.denied_reason_for_action('reacting_idea', reaction_mode: 'down')).to eq 'user_not_signed_in'
      end
    end
  end

  describe 'annotating_document_disabled_reason' do
    let(:project) { create(:single_phase_document_annotation_project, phase_attrs: { with_permissions: true }) }

    it 'returns `user_not_verified` when annotating the document not permitted and permitted group requires verification' do
      permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'annotating_document')
      verified_members = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
      permission.update!(permitted_by: 'users', groups: [create(:group), verified_members])
      expect(service.denied_reason_for_action('annotating_document')).to eq 'user_not_verified'
    end
  end

  describe 'taking_survey_disabled_reason' do
    let(:project) { create(:single_phase_typeform_survey_project, phase_attrs: { with_permissions: true }) }

    it 'returns `user_not_verified` when taking the survey is not permitted and a permitted group requires verification' do
      permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'taking_survey')
      verified_members = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
      permission.update!(permitted_by: 'users', groups: [create(:group), verified_members])
      expect(service.denied_reason_for_action('taking_survey')).to eq 'user_not_verified'
    end
  end

  describe 'taking_poll_disabled_reason' do
    let(:project) { create(:single_phase_poll_project, phase_attrs: { with_permissions: true }) }

    it 'return `user_not_verified` when taking the poll is not permitted and a permitted group requires verification' do
      permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'taking_poll')
      verified_members = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
      permission.update!(permitted_by: 'users', groups: [create(:group), verified_members])
      expect(service.denied_reason_for_action('taking_poll')).to eq 'user_not_verified'
    end
  end
end
