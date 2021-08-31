# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notification, type: :model do
  describe 'make_notifications_on' do
    it 'makes project_folder_moderation_rights_received notifications on user project_folder_moderation_rights_received' do
      folder = create(:project_folder)
      admin = create(:admin)
      user = create(:user)
      activity = create(:activity, item: user, action: 'project_folder_moderation_rights_received', payload: {project_folder_id: folder.id})

      notifications = ProjectFolders::Notifications::ProjectFolderModerationRightsReceived.make_notifications_on activity
      expect(notifications.map(&:recipient_id)).to match_array [user.id]
    end
  end

  it 'deleting a folder also deletes notifications referencing to it' do
    folder = create(:project_folder)
    create(:project_folder_moderation_rights_received, project_folder: folder)
    count = Notification.count
    folder.destroy!

    expect(Notification.count).to eq (count - 1)
  end
end
