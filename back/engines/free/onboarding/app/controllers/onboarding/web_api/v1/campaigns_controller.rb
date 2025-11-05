# frozen_string_literal: true

module Onboarding
  module WebApi
    module V1
      class CampaignsController < OnboardingController
        class Campaign < OpenStruct
          include ActiveModel::Serialization
          def id
            SecureRandom.uuid
          end

          def type
            Campaign
          end
        end

        def current
          authorize current_user, :update?
          service = OnboardingService.new
          current_campaign = service.current_campaign(current_user)
          custom_cta = current_campaign == :custom_cta

          app_config = AppConfiguration.instance
          campaign = Campaign.new({
            name: current_campaign,
            cta_message_multiloc: custom_cta ? app_config.settings('core', 'custom_onboarding_message') : nil,
            cta_button_multiloc: custom_cta ? app_config.settings('core', 'custom_onboarding_button') : nil,
            cta_button_link: custom_cta ? app_config.settings('core', 'custom_onboarding_link') : nil
          })

          render json: WebApi::V1::CampaignSerializer.new(campaign, params: jsonapi_serializer_params)
        end
      end
    end
  end
end
