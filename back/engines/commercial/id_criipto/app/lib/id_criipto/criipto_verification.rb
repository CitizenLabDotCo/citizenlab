# frozen_string_literal: true

module IdCriipto
  module CriiptoVerification # rubocop:disable Metrics/ModuleLength
    include Verification::VerificationMethod

    DK_MIT_ID = 'DK MitID'
    DEFAULT_UID_FIELD_PATTERN = '%{uuid}'

    def verification_method_type
      :omniauth
    end

    def id
      '5768eff0-05ce-5f55-a657-3284d38d102a'
    end

    def name
      'criipto'
    end

    def ui_method_name
      config[:ui_method_name].presence || name
    end

    def name_for_hashing
      config[:method_name_for_hashing].presence || config[:identity_source].presence || super
    end

    def config_parameters
      %i[
        identity_source
        birthday_custom_field_key
        birthyear_custom_field_key
        municipality_code_custom_field_key
        postal_code_custom_field_key
        domain
        client_id
        client_secret
        ui_method_name
        uid_field_pattern
        method_name_for_hashing
        minimum_age
        enabled_for_verified_actions
      ]
    end

    def config_parameters_schema
      {
        ui_method_name: {
          type: 'string',
          description: 'The name this verification method will have in the UI',
          default: 'MitID'
        },
        identity_source: {
          private: true,
          type: 'string',
          description: 'Which identity source is configured in Criipto?',
          enum: [DK_MIT_ID]
        },
        birthday_custom_field_key: {
          private: true,
          type: 'string',
          description: 'The `key` attribute of the custom field where the birthdate should be stored. Leave empty to not store the birthday. If it\'s set, the field will be locked for verified users.'
        },
        birthyear_custom_field_key: {
          private: true,
          type: 'string',
          description: 'The `key` attribute of the custom field where the birthyear should be stored (`birthyear` by default). Leave empty to not store the birthyear. If it\'s set, the field will be locked for verified users.'
        },
        municipality_code_custom_field_key: {
          private: true,
          type: 'string',
          description: 'Only for MitID: The `key` attribute of the custom field where the municipality_key should be stored. Leave empty to not store the municipality_key. We don\'t lock this field, assuming it is a hidden field.'
        },
        postal_code_custom_field_key: {
          private: true,
          type: 'string',
          description: 'Only for MitID: The `key` attribute of the custom field where the postal code should be stored. Leave empty to not store the postal code. We don\'t lock this field, assuming it is a hidden field.'
        },
        uid_field_pattern: {
          private: true,
          type: 'string',
          description: 'Pattern used for getting UID value. It can be used to switch (migrate) between different MitID verification (not SSO) providers that return different values in `sub`. Use ${value} for values from the auth->extra->raw_info object. Example: adfs|criipto-verify-DK-NemID-POCES|%{nameidentifier}. See the specs for all possible values.',
          default: DEFAULT_UID_FIELD_PATTERN
        },
        method_name_for_hashing: {
          private: true,
          type: 'string',
          description: 'If present, this method name will be used for hashing. It can be used to switch (migrate) between different MitID verification (not SSO) providers that return different values in `sub`. Leave empty to use the default MitID value. Example: auth0.'
        },
        minimum_age: {
          private: true,
          type: 'integer',
          description: 'Minimum age required to verify (in years). No value means no age minimum.'
        },
        enabled_for_verified_actions: {
          private: true,
          type: 'boolean',
          description: 'Whether this verification method should be enabled for verified actions.'
        }
      }
    end

    # copied from back/engines/commercial/id_nemlog_in/app/lib/id_nemlog_in/nemlog_in_verification.rb
    def entitled?(auth)
      minimum_age = config[:minimum_age]
      return true if minimum_age.blank?

      age = auth.extra.raw_info.age.to_i
      raise Verification::VerificationService::NotEntitledError, 'under_minimum_age' if age < minimum_age

      true
    end

    def exposed_config_parameters
      [
        :ui_method_name
      ]
    end

    def profile_to_uid(auth)
      case config[:identity_source]
      when DK_MIT_ID
        uid_pattern = config[:uid_field_pattern].presence || DEFAULT_UID_FIELD_PATTERN
        uid_pattern % auth.extra.raw_info.to_h.symbolize_keys
      else
        raise "Unsupported identity source #{config[:identity_source]}"
      end
    end

    def locked_attributes
      []
    end

    def locked_custom_fields
      [
        config[:birthday_custom_field_key].presence,
        config[:birthyear_custom_field_key].presence
      ].compact
    end

    def updateable_user_attrs
      super + %i[custom_field_values birthyear]
    end
  end
end
