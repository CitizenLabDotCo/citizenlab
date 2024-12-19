# frozen_string_literal: true

module IdBosaFas
  module BosaFasVerification
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

    def config_parameters
      %i[environment identifier secret enabled_for_verified_actions]
    end

    def config_parameters_schema
      {
        enabled_for_verified_actions: {
          private: true,
          type: 'boolean',
          description: 'Whether this verification method should be enabled for verified actions.'
        }
      }
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
