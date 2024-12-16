# frozen_string_literal: true

module Onboarding
  class OnboardingService
    def self.campaigns
      %w[complete_profile custom_cta default verification]
    end

    def current_campaign(user)
      raise ArgumentError unless user

      dismissals = CampaignDismissal.where(user: user).pluck(:campaign_name)
      _current_campaign(user, dismissals)
    end

    private

    def _current_campaign(user, dismissals)
      if needs_verification?(user) && dismissals.exclude?('verification')
        :verification
        elsif profile_incomplete?(user) && dismissals.exclude?('complete_profile')
        :complete_profile
      elsif custom_onboarding_message? && dismissals.exclude?('custom_cta')
        :custom_cta
      else
        :default
      end
    end

    def custom_onboarding_message?
      !MultilocService.new.empty?(AppConfiguration.instance.settings('core', 'custom_onboarding_message'))
    end

    def profile_incomplete?(user)
      MultilocService.new.empty?(user.bio_multiloc) ||
        user.avatar.blank? ||
        CustomField.registration.enabled.any? do |cf|
          user.custom_field_values[cf.key].nil?
        end
    end

    def needs_verification?(user)
      settings = ::SettingsService.new.disable_verification_if_no_methods_enabled(AppConfiguration.instance.settings)
      settings['verification']['enabled'] && !user.verified
    end
  end
end
