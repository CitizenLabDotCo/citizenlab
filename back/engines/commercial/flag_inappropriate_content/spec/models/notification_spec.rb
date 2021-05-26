# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notification, type: :model do
  describe 'make_notifications_on' do
    it 'makes inappropriate_content_flagged notifications on inappropriate_content_flag created' do
      flag = create(:inappropriate_content_flag)
      admin = create(:admin)
      user = create(:user)
      activity = create(:activity, item: flag, action: 'created')

      notifications = FlagInappropriateContent::Notifications::InappropriateContentFlagged.make_notifications_on activity
      expect(notifications.map(&:recipient_id)).to match_array [admin.id]
    end
  end

  it 'deleting a flag with notifications referencing to it' do
    flag = create(:inappropriate_content_flag)
    create(:inappropriate_content_flagged, inappropriate_content_flag: flag)
    flag.destroy!
  end
end
