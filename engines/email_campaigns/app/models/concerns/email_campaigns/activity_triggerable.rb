module EmailCampaigns
  module ActivityTriggerable
    extend ActiveSupport::Concern

    included do
      add_send_filter :filter_activity_triggered
    end

    def filter_activity_triggered activity:, time: nil
      activity_triggers.dig(activity.item_type, activity.action)
    end

  end
end