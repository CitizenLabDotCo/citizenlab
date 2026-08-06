# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notifications::VotingLastChance do
  describe 'make_notifications_on' do
    let_it_be(:participant, reload: true) { create(:user) }

    context 'when the phase is a voting phase' do
      let_it_be(:phase, reload: true) { create(:budgeting_phase, start_at: 1.month.ago, end_at: 2.days.from_now) }
      let_it_be(:idea, reload: true) { create(:idea, project_id: phase.project.id, author_id: participant.id) }
      let_it_be(:activity, reload: true) { create(:activity, item: phase, action: 'ending_soon') }

      it 'makes a notification when a voting phase is ending soon' do
        notifications = described_class.make_notifications_on activity
        expect(notifications.first).to have_attributes(
          recipient_id: participant.id,
          phase: phase
        )
      end

      it 'does not make a notification for a participant who has already voted' do
        create(:basket, user: participant, phase: phase, submitted_at: 1.week.ago)

        notifications = described_class.make_notifications_on activity
        expect(notifications).to eq []
      end
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
