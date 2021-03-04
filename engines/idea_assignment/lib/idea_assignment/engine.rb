# frozen_string_literal: true

# rubocop:disable Lint/SuppressedException
begin
  require 'factory_bot_rails'
rescue LoadError
end
# rubocop:enable Lint/SuppressedException

module IdeaAssignment
  class Engine < ::Rails::Engine
    isolate_namespace IdeaAssignment

    factories_path = File.expand_path('../../spec/factories', __dir__)
    config.factory_bot.definition_file_paths += [factories_path] if defined?(FactoryBotRails)

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
