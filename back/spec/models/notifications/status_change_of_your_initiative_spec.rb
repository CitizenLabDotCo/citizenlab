# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notifications::StatusChangeOfYourInitiative do
  describe 'make_notifications_on' do
    it 'makes a notification on created comment activity' do
      initiative = create(:initiative)
      status_change = create(:initiative_status_change, initiative: initiative, initiative_status: create(:initiative_status, code: 'answered'))
      activity = create(:activity, item: initiative, action: 'changed_status')

      notifications = described_class.make_notifications_on activity
      expect(notifications.first).to have_attributes(
        recipient_id: initiative.author_id,
        post_id: initiative.id,
        post_status_id: status_change.initiative_status_id
      )
    end
  end
end
