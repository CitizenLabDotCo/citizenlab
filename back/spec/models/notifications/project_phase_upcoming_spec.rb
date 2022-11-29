# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notifications::ProjectPhaseUpcoming, type: :model do
  describe 'make_notifications_on' do
    it 'makes a notification on created comment activity' do
      admin = create :admin
      phase = create :phase
      activity = create :activity, item: phase, action: 'upcoming'

      notifications = described_class.make_notifications_on activity
      expect(notifications.first).to have_attributes(
        recipient_id: admin.id,
        phase_id: phase.id,
        project_id: phase.project_id
      )
    end
  end
end
