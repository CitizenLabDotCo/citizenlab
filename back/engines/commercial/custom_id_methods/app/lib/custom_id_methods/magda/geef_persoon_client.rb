# frozen_string_literal: true

module CustomIdMethods::Magda
  # Client for MAGDA Persoon.GeefPersoon-02.02 (Rijksregister lookup by INSZ).
  # (The "Starten met testen" mail said 02.00, but MAGDA confirmed on 26/08 that
  # 02.00 is obsolete and 02.02 must be used.)
  # See BaseClient for the transport details.
  #
  # Note: the person must be registered in the MAGDA repertorium first
  # (RegistreerInschrijvingClient); an unregistered INSZ answers with
  # uitzondering 13202 or 40003 (`GeefPersoonResult#not_registered?`).
  class GeefPersoonClient < BaseClient
    NAMESPACE = 'http://magda.vlaanderen.be/persoon/soap/geefpersoon/v02_02'
    DIENST_NAAM = 'GeefPersoon'
    VERSIE = '02.02.0000'

    CONFIG_KEYS = (BASE_CONFIG_KEYS + %i[magda_endpoint]).freeze

    # @param config [Hash] the ACM id method config (symbol keys)
    def self.from_config(config)
      new(
        endpoint: config[:magda_endpoint],
        certificate: config[:magda_certificate],
        private_key: config[:magda_private_key],
        afzender_identificatie: config[:magda_afzender_identificatie],
        hoedanigheid: config[:magda_hoedanigheid],
        sign: config[:magda_sign_requests] != false
      )
    end

    def self.configured?(config)
      config.present? && CONFIG_KEYS.all? { |key| config[key].present? }
    end

    # @param insz [String] 11 digits
    # @param referte [String] unique per call, goes in both refertes of the request
    # @return [GeefPersoonResult]
    def call(insz, referte: SecureRandom.uuid, now: Time.now.in_time_zone(TIME_ZONE))
      response = call_dienst(inhoud_xml(insz), referte:, now:)
      GeefPersoonResult.from_xml(response.xml, http_status: response.http.code, referte:)
    rescue StandardError => e
      # Network, TLS, certificate or unexpected transport errors: the caller
      # must keep working and report `service_error`.
      GeefPersoonResult.service_error(e, referte:)
    end

    private

    def inhoud_xml(insz)
      <<~XML.strip
        <Criteria>
          <INSZ>#{escape(insz)}</INSZ>
        </Criteria>
        <Bron>RR</Bron>
        <Taal>nl</Taal>
      XML
    end
  end
end
