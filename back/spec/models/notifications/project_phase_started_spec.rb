require 'rails_helper'

RSpec.describe Notifications::ProjectPhaseStarted, type: :model do

  describe "make_notifications_on" do
    it "makes a notification on phase started activity" do
      user = create(:user)
      phase = create(:phase)
      activity = create(:activity, item: phase, action: 'started')

      notifications = Notifications::ProjectPhaseStarted.make_notifications_on activity
      expect(notifications.first).to have_attributes(
        recipient_id: user.id,
        phase_id: phase.id,
        project_id: phase.project_id
      )
    end
  end
end
