# frozen_string_literal: true

module Onboarding
  class OnboardingService
    def self.campaigns
      %w[complete_profile custom_cta default]
    end

    def current_campaign(user)
      raise ArgumentError unless user

      dismissals = CampaignDismissal.where(user: user).pluck(:campaign_name)
      _current_campaign(user, dismissals)
    end

    private

    def _current_campaign(user, dismissals)
      if profile_incomplete?(user) && dismissals.exclude?('complete_profile')
        :complete_profile
      elsif has_custom_onboarding_message? && dismissals.exclude?('custom_cta')
        :custom_cta
      else
        :default
      end
    end

    def has_custom_onboarding_message?
      !MultilocService.new.is_empty?(AppConfiguration.instance.settings('core', 'custom_onboarding_message'))
    end

    def profile_incomplete?(user)
      MultilocService.new.is_empty?(user.bio_multiloc) ||
        user.avatar.blank? ||
        CustomField.with_resource_type('User').enabled.any? do |cf|
          user.custom_field_values[cf.key].nil?
        end
    end
  end
end

Onboarding::OnboardingService.prepend_if_ee('Verification::Patches::Onboarding::OnboardingService')
