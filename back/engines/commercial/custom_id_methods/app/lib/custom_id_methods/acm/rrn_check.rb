# frozen_string_literal: true

module CustomIdMethods::Acm
  # Checks the rijksregisternummer (RRN / INSZ) that ACM returns against a residency
  # service and turns the outcome into one of: valid, lives_outside, under_minimum_age,
  # no_match, service_error. Two providers, selected with `rrn_provider`:
  # - `wijk_budget_api`: the Oostende WijkBudget API (city proxy in front of MAGDA),
  # - `magda`: MAGDA GeefPersoon directly, see CustomIdMethods::Magda.
  module RrnCheck
    RRN_PROVIDERS = %w[wijk_budget_api magda].freeze
    RRN_CHECK_KEY = 'rrn_check'

    # Outcome of the RRN check for this SSO round trip, or nil when no check is
    # configured. Memoized on the auth hash (under `extra.rrn_check`) because
    # `profile_to_user_attrs` runs more than once per login and the outcome is
    # reused for the verification activity payload. It holds the provider, the
    # result, the MAGDA referte and a timestamp; never the INSZ. As part of
    # `extra` it is persisted with the identity, as the last check.
    def rrn_check(auth)
      return nil if config.nil? || config[:rrn_result_custom_field_key].blank?

      auth['extra'] ||= {}
      auth['extra'][RRN_CHECK_KEY] ||= perform_rrn_check(auth.dig('extra', 'raw_info', 'rrn'))
    end

    # Extra payload for the 'created' activity of the verification,
    # see Verification::VerificationService#verify_omniauth.
    def verification_activity_payload(auth)
      check = auth.dig('extra', RRN_CHECK_KEY)
      check.present? ? { rrn_check: check.to_h } : {}
    end

    private

    def perform_rrn_check(rrn)
      case rrn_provider
      when 'magda' then magda_rrn_check(rrn)
      when 'wijk_budget_api' then wijk_budget_rrn_check(rrn)
      end
    end

    def rrn_provider
      config[:rrn_provider].presence || 'wijk_budget_api'
    end

    def wijk_budget_rrn_check(rrn)
      return nil if config[:rrn_api_key].blank? || config[:rrn_environment].blank?

      { 'provider' => 'wijk_budget_api', 'result' => wijk_budget_result(rrn), 'checked_at' => Time.now.utc.iso8601 }
    end

    def wijk_budget_result(rrn)
      api = CustomIdMethods::OostendeRrn::WijkBudgetApi.new(api_key: config[:rrn_api_key], environment: config[:rrn_environment])
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

    def magda_rrn_check(rrn)
      return nil unless CustomIdMethods::Magda::GeefPersoonClient.configured?(config)

      lookup = if rrn.present?
        magda_lookup_with_registration(rrn)
      else
        CustomIdMethods::Magda::GeefPersoonResult.service_error(ArgumentError.new('ACM returned no rrn'), referte: SecureRandom.uuid)
      end
      result = CustomIdMethods::Magda::ResidencyCheck.call(
        lookup,
        postal_codes: config[:magda_postal_codes],
        minimum_age: config[:magda_minimum_age]
      )
      if lookup.error? || lookup.not_registered?
        ErrorReporter.report_msg(
          'MAGDA GeefPersoon service error',
          extra: { referte: lookup.referte, http_status: lookup.http_status, error: lookup.error_message, uitzonderingen: lookup.uitzondering_codes }
        )
      end

      { 'provider' => 'magda', 'result' => result, 'referte' => lookup.referte, 'checked_at' => Time.now.utc.iso8601 }
    end

    # GeefPersoon only answers about persons that are registered in the MAGDA
    # repertorium. On the first check of a citizen: register the INSZ, then ask
    # again. Every call carries its own unique referte.
    def magda_lookup_with_registration(rrn)
      lookup = CustomIdMethods::Magda::GeefPersoonClient.from_config(config).call(rrn)
      return lookup unless lookup.not_registered?

      registration = CustomIdMethods::Magda::RegistreerInschrijvingClient.from_config(config).call(rrn)
      return lookup unless registration.ok?

      CustomIdMethods::Magda::GeefPersoonClient.from_config(config).call(rrn)
    end
  end
end
