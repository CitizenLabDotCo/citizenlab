# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notifications::ProjectReviewStateChange do
  describe '#make_notifications_on' do
    let(:notifications) { described_class.make_notifications_on(activity) }
    let(:project_review) { create(:project_review, :approved) }
    let(:activity) do
      create(:activity, item: project_review, action: 'changed', payload: { change: change })
    end

    context 'if the trigger activity is a project review approval' do
      let(:change) do
        now = Time.current
        { 'approved_at' => [nil, now], updated_at: [now - 1.minute, now] }
      end

      it 'creates a notification for the requester' do
        expect(notifications.size).to eq(1)
        notification = notifications.first

        expect(notification.recipient_id).to eq(project_review.requester_id)
        expect(notification.project_review).to eq(project_review)
      end
    end

    context 'if the trigger activity is not a project review approval' do
      let(:change) { { updated_at: [1.minute.ago, Time.current] } }

      it 'does not create a notification' do
        expect(notifications).to be_empty
      end
    end
  end
end
