module Onboarding
  class OnboardingService

    STATUSES = %i(complete_profile custom_cta default)

    def status user
      raise ArgumentError unless user
      if profile_incomplete? user
        :complete_profile
      elsif !MultilocService.new.is_empty?(Tenant.settings('core', 'custom_onboarding_message'))
        :custom_cta
      else
        :default
      end
    end

    private

    def profile_incomplete? user
      MultilocService.new.is_empty?(user.bio_multiloc) ||
        user.avatar.blank? ||
        CustomField.fields_for(User).enabled.any? do |cf|
          user.custom_field_values[cf.key].nil?
        end
    end

  end
end