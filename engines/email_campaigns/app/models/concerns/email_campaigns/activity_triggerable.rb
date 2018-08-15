module EmailCampaigns
  module ActivityTriggerable
    extend ActiveSupport::Concern

    included do
      unless respond_to? :activity_triggers
        raise "Class #{self.name} includes ActivityTriggerable but doesn't implement #activity_triggers"
      end
    end

    class_methods do
      def triggered_by? activity
        self.activity_triggers.dig(activity.item_type, activity.action)
      end
    end

  end
end