# frozen_string_literal: true

module CustomIdMethods
  module BosaFas::BosaFasVerification
    include Verification::VerificationMethod

    def verification_method_type
      :omniauth
    end

    def id
      '6a66cafb-08a8-451f-8c0b-f349cdfdaaee'
    end

    def name
      'bosa_fas'
    end

    def config_parameters_schema
      default_config_schema.merge!(SCHEMA_ENVIRONMENT)
    end

    def entitled?(_auth)
      true
    end

    def profile_to_uid(auth)
      auth['uid'] || auth.dig('extra', 'raw_info', 'egovNRN')
    end

    def locked_attributes
      %i[first_name last_name]
    end

    def locked_custom_fields
      []
    end
  end
end
