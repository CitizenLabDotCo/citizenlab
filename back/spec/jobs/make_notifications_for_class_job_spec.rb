# frozen_string_literal: true

require 'rails_helper'

RSpec.describe MakeNotificationsForClassJob do
  subject(:job) { described_class.new }

  describe '#perform' do
    it 'persists notifications when all are valid' do
      activity = create(:admin_rights_given_activity)
      job.perform(Notifications::AdminRightsReceived.name, activity)
      expect(Notification.count).to eq 1
      expect(Notification.first).to have_attributes({
        initiating_user_id: activity.user_id,
        recipient_id: activity.item_id
      })
    end

    it "doesn't persist any notification when one is invalid" do
      activity = create(:admin_rights_given_activity)
      activity.item.destroy!
      expect { job.perform(Notifications::AdminRightsReceived.name, activity) }
        .to raise_error(ActiveRecord::RecordInvalid)
      expect(Notification.count).to eq 0
    end

    it 'enqueues notification created activity' do
      activity = create(:admin_rights_given_activity)
      expect { job.perform(Notifications::AdminRightsReceived.name, activity) }
        .to have_enqueued_job(LogActivityJob)
    end
  end
end
