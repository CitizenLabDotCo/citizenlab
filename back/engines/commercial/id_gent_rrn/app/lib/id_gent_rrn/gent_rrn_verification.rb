# frozen_string_literal: true

module IdGentRrn
  class GentRrnVerification
    include Verification::VerificationMethod

    def verification_method_type
      :manual_sync
    end

    def id
      '8a6d6f7e-a451-41ea-8e0a-0021439923a0'
    end

    def name
      'gent_rrn'
    end

    def config_parameters
      %i[api_key environment custom_field_key wijk_mapping]
    end

    def config_parameters_schema
      {
        environment: {
          type: 'string',
          enum: %w[dv qa production],
          private: true
        },
        custom_field_key: {
          type: 'string',
          description: 'The key of the custom field that stores the "wijk"',
          private: true
        },
        wijk_mapping: {
          type: 'object',
          description: 'Maps wijknummers (see https://data.stad.gent/explore/dataset/stadswijken-gent/table/) to custom_field_value keys',
          properties: (1..25).to_h do |i|
            [i.to_s, { type: 'string' }]
          end,
          additionalProperties: false,
          private: true
        }
      }
    end

    def locked_custom_fields
      [config[:custom_field_key]]
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

      {
        uid: rrn,
        custom_field_values: {
          config[:custom_field_key] => map_wijk(body.dig('verificatieResultaat', 'wijkNr'))
        }.compact
      }.compact
    end

    def map_wijk(wijk_nr)
      wijk_nr && config[:wijk_mapping] && config[:wijk_mapping][wijk_nr]
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
