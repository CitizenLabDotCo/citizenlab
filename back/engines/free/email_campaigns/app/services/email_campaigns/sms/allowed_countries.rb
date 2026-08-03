# frozen_string_literal: true

module EmailCampaigns
  module Sms
    class AllowedCountries
      # Whether SMS may be sent to a number in this ISO 3166-1 alpha-2 country.
      # An empty / absent allow-list means all countries are allowed.
      def self.allowed?(iso_country)
        allowed = AppConfiguration.instance.settings('sms', 'allowed_country_codes')
        return true if allowed.blank?

        allowed.include?(iso_country)
      end
    end
  end
end
