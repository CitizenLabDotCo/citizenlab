module Onboarding
  class WebApi::V1::OnboardingStatusesController < OnboardingController

    class OnboardingStatus < OpenStruct
      include ActiveModel::Serialization
      def type
        OnboardingStatus
      end
    end


    def show
      authorize current_user
      service = OnboardingService.new
      status = service.status(current_user)
      custom_cta = status == :custom_cta
      onboarding_status = OnboardingStatus.new({
        status: status,
        cta_message_multiloc: custom_cta ? Tenant.settings('core','custom_onboarding_message') : nil,
        cta_button_multiloc: custom_cta ? Tenant.settings('core','custom_onboarding_button') : nil,
        cta_button_link: custom_cta ? Tenant.settings('core','custom_onboarding_link') : nil,
      })
      render json: onboarding_status
    end

    def secure_controller?
      true
    end
  end
end