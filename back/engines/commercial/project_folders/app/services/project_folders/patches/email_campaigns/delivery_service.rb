module ProjectFolders
  module Patches
    module EmailCampaigns
      module DeliveryService
        def campaign_classes
          super + [
            ProjectFolders::EmailCampaigns::Campaigns::ProjectFolderModerationRightsReceived
          ]
        end
      end
    end
  end
end
