module Onboarding
  class WebApi::V1::CampaignSerializer < ::WebApi::V1::BaseSerializer
    set_type 'onboarding_campaign'

    attribute :name
    attribute :cta_message_multiloc
    attribute :cta_button_multiloc
    attribute :cta_button_link
  end
end