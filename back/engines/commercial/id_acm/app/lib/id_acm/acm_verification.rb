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
        api_key
        environment
      ]
    end

    def config_parameters_schema
      {
        ui_method_name: {
          type: 'string',
          description: 'The name this verification method will have in the UI',
          default: 'ACM'
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
      super + %i[first_name last_name]
    end

    def ui_method_name
      config[:ui_method_name] || name
    end

    def verify_sync(rrn:)
      validate_citizen!(rrn)
    end

    def verification_parameters(auth)
      { rrn: auth.info.rrn }
    end

    def validate_citizen!(rrn)
      api = IdOostendeRrn::WijkBudgetApi.new(api_key: config[:api_key], environment: config[:environment])
      response = api.verificatie(rrn)

      raise RuntimeError(response) unless response.success?

      body = response.parsed_response
      reason = body.dig('verificatieResultaat', 'redenNietGeldig')

      binding.pry

      raise Verification::VerificationService::NoMatchError if reason&.include? 'ERR10'
      raise Verification::VerificationService::NotEntitledError, 'lives_outside' if reason&.include? 'ERR11'
      raise Verification::VerificationService::NotEntitledError, 'too_young' if reason&.include? 'ERR12'

      raise Verification::VerificationService::NoMatchError unless body.dig('verificatieResultaat', 'geldig')

      { uid: rrn }
    end

  end
end
