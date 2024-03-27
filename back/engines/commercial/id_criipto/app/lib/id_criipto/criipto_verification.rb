# frozen_string_literal: true

module IdCriipto
  module CriiptoVerification
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

    def name_for_hashing
      config[:method_name_for_hashing].presence || super
    end

    def config_parameters
      %i[
        identity_source
        birthday_custom_field_key
        municipality_code_custom_field_key
        domain
        client_id
        client_secret
        method_name_multiloc
        uid_field_pattern
        method_name_for_hashing
      ]
    end

    def config_parameters_schema
      {
        method_name_multiloc: {
          '$ref': '#/definitions/multiloc_string',
          description: 'The name this verification method will have in the UI'
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
        uid_field_pattern: {
          private: true,
          type: 'string',
          description: 'It is the legacy of tenants migrated from Auth0, but can be used with other MitID providers too. Pattern used for getting UID value. Use ${value} for values from the auth->extra->raw_info object. Example: adfs|criipto-verify-DK-NemID-POCES|%{nameidentifier}. See the specs for all possible values.',
          default: DEFAULT_UID_FIELD_PATTERN
        },
        method_name_for_hashing: {
          private: true,
          type: 'string',
          description: 'It is the legacy of tenants migrated from Auth0, but can be used with other MitID providers too. If present, this method name will be used for hashing. Leave empty to use the default Criipto value. Example: auth0.'
        }
      }
    end

    def exposed_config_parameters
      [
        :method_name_multiloc
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
      %i[custom_field_values birthyear]
    end
  end
end
