# frozen_string_literal: true

module IdOostendeRrn
  class OostendeRrnVerification
    include Verification::VerificationMethod

    def verification_method_type
      :manual_sync
    end

    def id
      '00c4faa6-4b0f-11ed-b878-0242ac120002'
    end

    def name
      'oostende_rrn'
    end

    def config_parameters
      %i[api_key environment]
    end

    def config_parameters_schema
      {
        environment: {
          type: 'string',
          enum: %w[dv qa production],
          private: true
        }
      }
    end

    def locked_custom_fields
      []
    end

    def verification_parameters
      [:rrn]
    end

    def verify_sync(rrn:)
      cleaned_rrn = clean_rrn(rrn)
      raise Verification::VerificationService::ParameterInvalidError, 'rrn' unless rrn_valid?(cleaned_rrn)

      validate_citizen!(cleaned_rrn)
    end

    private

    def validate_citizen!(rrn)
      api = WijkBudgetApi.new(api_key: config[:api_key], environment: config[:environment])
      response = api.verificatie(rrn)

      raise RuntimeError(response) unless response.success?

      body = response.parsed_response
      reason = body.dig('verificatieResultaat', 'redenNietGeldig')

      raise Verification::VerificationService::NoMatchError if reason&.include? 'ERR10'
      raise Verification::VerificationService::NotEntitledError, 'lives_outside' if reason&.include? 'ERR11'
      raise Verification::VerificationService::NotEntitledError, 'under_minimum_age' if reason&.include? 'ERR12'

      raise Verification::VerificationService::NoMatchError unless body.dig('verificatieResultaat', 'geldig')

      { uid: rrn }
    end

    # Validates the format of the Belgian rijksregisternummer, including a check on the last 2 check digits
    def rrn_valid?(rrn)
      return false if rrn.blank?
      return false if rrn.length != 11

      unique_part = rrn[0..8]
      check_digit = rrn[-2..].to_i

      vanilla_check = 97 - (unique_part.to_i % 97)
      y2k_check = 97 - ("2#{unique_part}".to_i % 97)

      [vanilla_check, y2k_check].include?(check_digit)
    end

    def clean_rrn(rrn)
      rrn.tr('^0-9', '')
    end
  end
end
