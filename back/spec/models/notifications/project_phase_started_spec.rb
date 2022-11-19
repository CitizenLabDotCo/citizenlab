# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notifications::ProjectPhaseStarted, type: :model do
  describe 'make_notifications_on' do
    it 'makes a notification on phase started activity' do
      user = create(:user)
      phase = create(:phase)
      activity = create :activity, item: phase, action: 'started', user: nil

      notifications = described_class.make_notifications_on activity
      expect(notifications.size).to eq 1
      expect(notifications.first).to have_attributes(
        recipient_id: user.id,
        phase_id: phase.id,
        project_id: phase.project_id
      )
    end

    it 'only creates a notification for users who can participate' do
      phase = create :phase
      activity = create :activity, item: phase, action: 'started'
      create_list :user, 2
      allow_any_instance_of(ParticipationContextService).to(
        receive(:participation_possible_for_context?).and_return(true, false)
      )

      notifications = described_class.make_notifications_on activity
      expect(notifications.size).to eq 1
    end
  end
end
