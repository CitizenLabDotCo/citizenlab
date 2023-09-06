# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notifications::ProjectPhaseStarted do
  describe 'make_notifications_on' do
    let(:project) { create(:project_with_current_phase) }
    let(:activity) { create(:activity, item: project.phases[2], action: 'started') }

    it 'only notifies participants and followers of the project' do
      follower = create(:follower, followable: project)
      participant = create(:user)
      _non_participant = create(:user)

      idea = create(:idea, project_id: project.id, author_id: participant.id)
      create(:activity, item: idea, user_id: participant.id, action: 'published')

      notifications = described_class.make_notifications_on activity
      expect(notifications.map(&:recipient_id)).to contain_exactly follower.user_id, participant.id
    end

    it 'only notifies users who have access to the project' do
      project.update!(visible_to: 'groups', groups: [create(:group)])

      included_follower = create(:follower, followable: project, user: create(:user, manual_groups: [project.groups.first]))
      _excluded_follower = create(:follower, followable: project, user: create(:user))

      notifications = described_class.make_notifications_on activity
      expect(notifications.map(&:recipient_id)).to contain_exactly included_follower.user_id
    end
  end
end
