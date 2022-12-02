# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notifications::ProjectPhaseStarted, type: :model do
  describe 'make_notifications_on' do
    let!(:project) { create(:project_with_current_phase) }
    let!(:activity) { create(:activity, item: project.phases[2], action: 'started') }

    it 'only notifies users who participated in project' do
      participant = create(:user)
      non_participant = create(:user)

      idea = create(:idea, project_id: project.id, author_id: participant.id)
      create(:activity, item: idea, user_id: participant.id, action: 'published')

      notifications = described_class.make_notifications_on activity
      recipient_ids = notifications.pluck(:recipient_id)

      expect(recipient_ids).to include participant.id
      expect(recipient_ids).not_to include non_participant.id
    end

    it 'only notifies users who can participate in project' do
      project.update!(visible_to: 'groups', groups: [create(:group)])

      group_member = create(:user, email: 'user1@example.com', manual_groups: [project.groups.first])
      other_user = create(:user, email: 'user2@example.com')

      # Both users participate in project and an activity exists for each participation event.
      idea1 = create(:idea, project_id: project.id, author_id: group_member.id)
      idea2 = create(:idea, project_id: project.id, author_id: other_user.id)
      create(:activity, item: idea1, user_id: group_member.id, action: 'published')
      create(:activity, item: idea2, user_id: other_user.id, action: 'published')

      notifications = described_class.make_notifications_on(activity)

      expect(notifications.map(&:recipient_id)).to match_array [group_member.id]
    end
  end
end
