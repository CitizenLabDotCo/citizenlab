# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notifications::VotingLastChance do
  describe 'make_notifications_on' do
    let(:participant) { create(:user) }

    it 'makes a notification when a voting phase is ending soon' do
      phase = create(:budgeting_phase)
      create(:idea, project_id: phase.project.id, author_id: participant.id)
      activity = create(:activity, item: phase, action: 'ending_soon')

      notifications = described_class.make_notifications_on activity
      expect(notifications.first).to have_attributes(
        recipient_id: participant.id,
        phase: phase
      )
    end

    it 'does not make a notification when a non-voting phase is ending soon' do
      phase = create(:phase)
      create(:idea, project_id: phase.project.id, author_id: participant.id)
      activity = create(:activity, item: phase, action: 'ending_soon')

      notifications = described_class.make_notifications_on activity
      expect(notifications).to eq []
    end
  end
end
