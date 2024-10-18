# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notifications::VotingResultsPublished do
  describe 'make_notifications_on' do
    let(:participant) { create(:user) }

    it 'makes a notification when a voting phase has ended' do
      phase = create(:budgeting_phase)
      create(:idea, project_id: phase.project.id, author_id: participant.id)
      activity = create(:activity, item: phase, action: 'ended')

      notifications = described_class.make_notifications_on activity
      expect(notifications.first).to have_attributes(
        type: 'Notifications::VotingResultsPublished',
        recipient_id: participant.id,
        phase: phase
      )
    end

    it 'does not make a notification when a non-voting phase has ended' do
      phase = create(:phase)
      create(:idea, project_id: phase.project.id, author_id: participant.id)
      activity = create(:activity, item: phase, action: 'ended')

      notifications = described_class.make_notifications_on activity
      expect(notifications).to eq []
    end
  end
end
