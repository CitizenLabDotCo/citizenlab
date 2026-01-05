# frozen_string_literal: true

module IdAcm
  module AcmVerification
    include Verification::VerificationMethod

    def verification_method_type
      :omniauth
    end

    def id
      'e8f3a1b2-9c4d-4e5f-a6b7-c8d9e0f1a2b3'
    end

    def name
      'acm'
    end

    def config_parameters
      %i[
        ui_method_name
        domain
        client_id
        client_secret
        enabled_for_verified_actions
        hide_from_profile
        rrn_api_key
        rrn_environment
      ]
    end

    def config_parameters_schema
      {
        ui_method_name: {
          type: 'string',
          title: 'The name this verification method will have in the UI',
          default: 'ACM'
        },
        rrn_environment: {
          type: 'string',
          enum: %w[dv qa production],
          private: true
        },
        rrn_api_key: {
          type: 'string',
          private: true
        },
        rrn_result_custom_field_key: {
          private: true,
          type: 'string',
          description: 'The `key` attribute of the select custom field where the result of RRN validation should be stored. Leave empty to not qualify using the RRN API. If it\'s set, the field will be locked for verified users.'
        },
        enabled_for_verified_actions: {
          private: true,
          type: 'boolean',
          description: 'Whether this verification method should be enabled for verified actions.'
        },
        hide_from_profile: {
          private: true,
          type: 'boolean',
          description: 'Should verification be hidden in the user profile and under the username?'
        }
      }
    end

    def exposed_config_parameters
      [
        :ui_method_name
      ]
    end

    def locked_attributes
      %i[first_name last_name]
    end

    def other_attributes
      %i[email]
    end

    def profile_to_uid(auth)
      auth['uid']
    end

    def updateable_user_attrs
      super + %i[first_name last_name custom_field_values]
    end

    def ui_method_name
      config[:ui_method_name] || name
    end

    private

    def rnn_verification_result(rrn)
      return nil if config[:rrn_api_key].blank? || config[:rrn_environment].blank?

      api = IdOostendeRrn::WijkBudgetApi.new(api_key: config[:rrn_api_key], environment: config[:rrn_environment])
      response = api.verificatie(rrn)
      return 'service_error' unless response.success?

      body = response.parsed_response
      reason = body.dig('verificatieResultaat', 'redenNietGeldig')
      return 'no_match' if reason&.include? 'ERR10'
      return 'lives_outside' if reason&.include? 'ERR11'
      return 'under_minimum_age' if reason&.include? 'ERR12'
      return 'no_match' unless body.dig('verificatieResultaat', 'geldig')

      'valid'
    end
  end
end
