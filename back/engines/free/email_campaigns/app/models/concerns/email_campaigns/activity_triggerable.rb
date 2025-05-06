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

      # Only report if the activity is actually too old
      # Report so that we can examine the backtraces to get more context
      # on why this is happening (see: TAN-4469)
      if activity.acted_at < 7.days.ago
        ErrorReporter.report_msg(
          'ActivityTriggerable attempted to process an old activity',
          extra: {
            activity_id: activity.id,
            activity_type: activity.item_type,
            activity_action: activity.action,
            activity_acted_at: activity.acted_at,
            campaign_id: id,
            campaign_type: self.class.name
          }
        )
        return false
      end

      true
    end
  end
end
