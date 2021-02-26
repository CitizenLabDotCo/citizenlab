module EmailCampaigns
  module ActivityTriggerable
    extend ActiveSupport::Concern

    included do
      before_send :filter_activity_triggered
    end

    def filter_activity_triggered activity:, time: nil
      activity && activity_triggers.dig(activity.item_type, activity.action)
    end
  end
end
