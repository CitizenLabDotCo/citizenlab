# frozen_string_literal: true

module Onboarding
  class OnboardingService
    CAMPAIGNS = %w[verification complete_profile custom_cta default].freeze

    def current_campaign(user)
      raise ArgumentError unless user

      dismissals = CampaignDismissal.where(user: user).pluck(:campaign_name)
      if Tenant.current.feature_activated?('verification') && !user.verified && dismissals.exclude?('verification')
        :verification
      elsif profile_incomplete?(user) && dismissals.exclude?('complete_profile')
        :complete_profile
      elsif !MultilocService.new.is_empty?(Tenant.settings('core',
                                                           'custom_onboarding_message')) && dismissals.exclude?('custom_cta')
        :custom_cta
      else
        :default
      end
    end

    private

    def profile_incomplete?(user)
      MultilocService.new.is_empty?(user.bio_multiloc) ||
        user.avatar.blank? ||
        CustomField.with_resource_type('User').enabled.any? do |cf|
          user.custom_field_values[cf.key].nil?
        end
    end
  end
end
