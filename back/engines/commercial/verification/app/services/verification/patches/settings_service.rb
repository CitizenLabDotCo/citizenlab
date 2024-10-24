# frozen_string_literal: true

module Verification
  module Patches
    module SettingsService
      def format_for_front_end(settings, schema)
        settings = disable_verification_if_no_methods_enabled(settings)
        super
      end

      # Ensures the FE does not show verification if:
      # a) There are no verification methods
      # b) All verification methods are flagged as 'hide_from_profile'
      def disable_verification_if_no_methods_enabled(settings)
        return settings if !settings['verification'] || settings['verification']['enabled'] == false

        enabled = settings['verification']['verification_methods'].present?
        enabled = false if settings['verification']['verification_methods']&.pluck('hide_from_profile')&.all?(true)

        settings['verification']['enabled'] = enabled
        settings
      end
    end
  end
end
