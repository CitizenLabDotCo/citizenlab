module FlagInappropriateContent
  module Patches
    module EmailCampaigns
      module DeliveryService
        def campaign_types
          super + [
           FlagInappropriateContent::EmailCampaigns::Campaigns::InappropriateContentFlagged
          ].map(&:name)
        end
      end
    end
  end
end
