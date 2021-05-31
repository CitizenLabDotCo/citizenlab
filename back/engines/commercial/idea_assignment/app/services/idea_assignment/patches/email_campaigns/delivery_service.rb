module IdeaAssignment
  module Patches
    module EmailCampaigns
      module DeliveryService

        def campaign_types
          super + [
           IdeaAssignment::EmailCampaigns::Campaigns::IdeaAssignedToYou
          ].map(&:name)
        end
      end
    end
  end
end
