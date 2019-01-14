module Onboarding
  class WebApi::V1::CampaignSerializer < ActiveModel::Serializer
    type 'onboarding_campaign'

    attribute :name
    attribute :cta_message_multiloc
    attribute :cta_button_multiloc
    attribute :cta_button_link
  end
end