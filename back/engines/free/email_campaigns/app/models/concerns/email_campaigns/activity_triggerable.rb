# frozen_string_literal: true

module EmailCampaigns
  module ActivityTriggerable
    extend ActiveSupport::Concern

    included do
      before_send :filter_activity_triggered
      before_send :filter_activity_too_old
    end

    def filter_activity_triggered(activity:, time: nil)
      activity && activity_triggers.dig(activity.item_type, activity.action)
    end

    # Skip activities that are older than a reasonable threshold
    # to prevent reprocessing of old activities
    def filter_activity_too_old(activity:, time: nil)
      return false if activity.nil?

      activity.acted_at >= 7.days.ago
    end
  end
end
