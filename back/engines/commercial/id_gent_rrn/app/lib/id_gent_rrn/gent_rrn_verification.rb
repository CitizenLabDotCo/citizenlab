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
      [:api_key]
    end

    def verification_parameters
      [:rrn]
    end

    def verify_sync(rrn:)
      cleaned_rrn = clean_rrn(rrn)
      raise Verification::VerificationService::ParameterInvalidError, 'rrn' unless rnn_valid?(cleaned_rrn)

      validate_citizen!(cleaned_rrn)
    end

    private

    def validate_citizen!(rrn)
      api = WijkBudgetApi.new(config[:api_key])
      response = api.verificatie(rrn)

      if response.success?
        body = response.parsed_response

        raise RuntimeError if body['ErrCodes'].include? 'ERR10'
        raise Verification::VerificationService::NotEntitledError if body['ErrCodes'].include? 'ERR11'
        raise Verification::VerificationService::NotEntitledError if body['ErrCodes'].include? 'ERR12'

        raise Verification::VerificationService::NoMatchError unless body['isValid']

        {
          uid: rrn
        }
      else
        raise RuntimeError
      end
    end

    def rnn_valid?(rrn)
      return false if rrn.blank?
      return false if rrn.length != 11

      unique_part = rrn[0..8]
      check_digit = rrn[-2..-1].to_i

      vanilla_check = 97 - (unique_part.to_i % 97)
      y2k_check = 97 - ("2#{unique_part}".to_i % 97)
      return false if check_digit != vanilla_check && check_digit != y2k_check

      true
    end

    def clean_rrn(rrn)
      rrn.tr('^0-9', '')
    end
  end
end
