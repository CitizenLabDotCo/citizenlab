module IdeaAssignment
  class Engine < ::Rails::Engine
    isolate_namespace IdeaAssignment

    config.to_prepare do
      ::NotificationToSerializerMapper.add_to_map(
        ::IdeaAssignment::Notifications::IdeaAssignedToYou =>
          ::IdeaAssignment::WebApi::V1::Notifications::IdeaAssignedToYouSerializer
      )

      if defined? ::EmailCampaigns
        ::EmailCampaigns::DeliveryService.add_campaign_types(
          ::IdeaAssignment::EmailCampaigns::Campaigns::IdeaAssignedToYou
        )
      end
    end
  end
end
