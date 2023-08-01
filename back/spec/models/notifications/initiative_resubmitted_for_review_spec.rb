# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notifications::InitiativeResubmittedForReview do
  describe '.make_notifications_on' do
    it 'makes a notification on created comment activity' do
      assignee = create(:admin)
      initiative = create(:initiative, assignee: assignee)
      create(:initiative_status_change, initiative: initiative, initiative_status: create(:initiative_status, code: 'rejected_on_review'))
      create(:initiative_status_change, initiative: initiative, initiative_status: create(:initiative_status, code: 'review_pending'))
      activity = create(:activity, item: initiative, action: 'changed_status')

      notifications = described_class.make_notifications_on activity
      expect(notifications.first).to have_attributes(
        recipient_id: assignee.id,
        post_id: initiative.id
      )
    end
  end
end
