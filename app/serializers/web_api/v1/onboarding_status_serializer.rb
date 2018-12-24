class WebApi::V1::OnboardingStatusSerializer < ActiveModel::Serializer
  type 'onboarding_status'

  attribute :status
  attribute :cta_message_multiloc
  attribute :cta_button_multiloc
  attribute :cta_button_link
end
