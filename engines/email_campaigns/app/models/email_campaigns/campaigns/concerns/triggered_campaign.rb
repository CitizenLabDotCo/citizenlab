module EmailCampaigns
  module TriggeredCampaign
    extend ActiveSupport::Concern

    included do

    end

    class_methods do
      def schedulable
        false
      end
    end

    def should_send?
      true
    end

  end
end