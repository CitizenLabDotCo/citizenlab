# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notifications::EventUpcoming do
  describe 'make_notifications_on' do
    it 'makes a notification on event upcoming activity' do
      attendee = create(:user)
      event = create(:event, attendees: [attendee])
      activity = create(:activity, item: event, action: 'upcoming')

      notifications = described_class.make_notifications_on activity
      expect(notifications.first).to have_attributes(
        recipient_id: attendee.id,
        event_id: event.id,
        project_id: event.project_id
      )
    end
  end
end
