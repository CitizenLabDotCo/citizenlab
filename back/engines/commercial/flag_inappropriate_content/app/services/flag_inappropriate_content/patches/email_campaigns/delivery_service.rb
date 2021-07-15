module FlagInappropriateContent
  module Patches
    module EmailCampaigns
      module DeliveryService
        def campaign_classes
          super + [
            FlagInappropriateContent::EmailCampaigns::Campaigns::InappropriateContentFlagged
          ]
        end
      end
    end
  end
end
