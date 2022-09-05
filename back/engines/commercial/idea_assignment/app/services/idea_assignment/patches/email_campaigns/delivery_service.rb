# frozen_string_literal: true

module IdeaAssignment
  module Patches
    module EmailCampaigns
      module DeliveryService
        def campaign_classes
          super + [
            IdeaAssignment::EmailCampaigns::Campaigns::IdeaAssignedToYou
          ]
        end
      end
    end
  end
end
