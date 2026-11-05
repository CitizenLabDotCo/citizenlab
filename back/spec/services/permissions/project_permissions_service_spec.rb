require 'rails_helper'

describe Permissions::ProjectPermissionsService do
  let(:service) { described_class.new(project, user) }
  let(:user) { create(:user) }

  describe 'attending_event denied_reason_for_action' do
    context 'user not signed in' do
      let(:user) { nil }
      let(:project) { create(:project_with_current_phase) }

      it 'returns `user_not_signed_in` when user needs to be signed in' do
        expect(service.denied_reason_for_action('attending_event')).to eq 'user_not_signed_in'
      end
    end

    context 'when attending is restricted to groups the user is not in' do
      let(:project) { create(:project_with_current_phase, current_phase_attrs: { with_permissions: true }) }

      it 'returns `user_not_in_group`' do
        permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'attending_event')
        permission.update!(
          permitted_by: 'users',
          group_ids: create_list(:group, 2).map(&:id)
        )
        expect(service.denied_reason_for_action('attending_event')).to eq 'user_not_in_group'
      end
    end

    context 'when the timeline is over' do
      let(:project) { create(:project_with_past_phases) }

      it 'returns nil - attending is allowed even though the phase is over' do
        expect(service.denied_reason_for_action('attending_event')).to be_nil
      end
    end

    context 'when the project is archived' do
      let(:project) { create(:project_with_current_phase, admin_publication_attributes: { publication_status: 'archived' }) }

      it "returns 'project_inactive'" do
        expect(service.denied_reason_for_action('attending_event')).to eq 'project_inactive'
      end
    end

    context 'when the phase is a community monitor phase' do
      let(:phase) { create(:community_monitor_survey_phase) }
      let(:project) { phase.project }

      it "returns 'attending_event_not_supported'" do
        expect(service.denied_reason_for_action('attending_event')).to eq 'attending_event_not_supported'
      end
    end
  end

  describe 'action_descriptors' do
    let(:project) { create(:project_with_current_phase) }

    it 'returns only the attending_event descriptor' do
      expect(service.action_descriptors).to eq(
        attending_event: { enabled: true, disabled_reason: nil }
      )
    end
  end
end
