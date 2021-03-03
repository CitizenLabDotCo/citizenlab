module IdeaAssignment
  class Railtie < ::Rails::Engine
    isolate_namespace IdeaAssignment

    config.to_prepare do
      ::NotificationToSerializerMapper.add_set(
        ::IdeaAssignment::Notifications::IdeaAssignedToYou,
        ::IdeaAssignment::WebApi::V1::Notifications::IdeaAssignedToYouSerializer
      )

      if defined? ::EmailCampaigns
        ::EmailCampaigns::DeliveryService.add_campaign_types(
          ::IdeaAssignment::EmailCampaigns::Campaigns::IdeaAssignedToYouMailer
        )
      end
    end
  end
end
