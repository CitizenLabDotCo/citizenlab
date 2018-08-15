module EmailCampaigns
  module ActivityTriggerable
    extend ActiveSupport::Concern

    class_methods do
      def triggered_by? activity
        self.activity_triggers.dig(activity.item_type, activity.action)
      end
    end

  end
end