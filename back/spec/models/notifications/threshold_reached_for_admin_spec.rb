# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notifications::ThresholdReachedForAdmin do
  describe 'make_notifications_on' do
    it 'makes a notification on an idea reaching the threshold_reached status for admins and moderators' do
      status = create(:proposal_status_threshold_reached)
      proposal = create(:proposal, idea_status: status)
      activity = create(:idea_changed_status_activity, item: proposal, payload: { change: [nil, status.id] }, user: nil)

      recipient = create(:admin)
      recipient2 = create(:project_moderator, projects: [proposal.project])
      _non_recipient = create(:user)
      _non_recipient2 = create(:project_moderator)

      notifications = described_class.make_notifications_on(activity)
      expect(notifications.size).to eq(2)
      expect(notifications).to include(have_attributes(
        recipient_id: recipient.id,
        post_id: proposal.id,
        post_status_id: status.id,
        initiating_user: nil
      ))
      expect(notifications).to include(have_attributes(
        recipient_id: recipient2.id
      ))
    end

    it 'does not make a notification on an idea not reaching the threshold_reached status' do
      status = create(:proposals_status, code: 'proposed')
      proposal = create(:proposal, idea_status: status)
      activity = create(:idea_changed_status_activity, item: proposal, payload: { change: [nil, status.id] }, user: nil)

      expect(described_class.make_notifications_on(activity)).to be_empty
    end
  end
end
