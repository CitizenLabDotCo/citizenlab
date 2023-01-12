# frozen_string_literal: true

module Onboarding
  class OnboardingService
    def self.campaigns
      %w[default]
    end

    def current_campaign(user)
      raise ArgumentError unless user
      :default
    end

    def custom_onboarding_message?
      !MultilocService.new.empty?(AppConfiguration.instance.settings('core', 'custom_onboarding_message'))
    end

  end
end

Onboarding::OnboardingService.prepend_if_ee('Verification::Patches::Onboarding::OnboardingService')
