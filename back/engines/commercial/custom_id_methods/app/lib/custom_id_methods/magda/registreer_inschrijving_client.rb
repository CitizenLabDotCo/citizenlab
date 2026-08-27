# frozen_string_literal: true

module CustomIdMethods::Magda
  # Client for MAGDA Repertorium.RegistreerInschrijving-02.00: registers a person
  # (INSZ) in the MAGDA repertorium, which is required before GeefPersoon can be
  # asked about that person. See BaseClient for the transport details.
  class RegistreerInschrijvingClient < BaseClient
    NAMESPACE = 'http://webservice.registreerinschrijvingdienst-02_00.repertorium-02_00.vip.vlaanderen.be'
    DIENST_NAAM = 'RegistreerInschrijving'

    CONFIG_KEYS = (BASE_CONFIG_KEYS + %i[magda_inschrijving_endpoint]).freeze

    # @param config [Hash] the ACM id method config (symbol keys)
    def self.from_config(config)
      new(
        endpoint: config[:magda_inschrijving_endpoint],
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
    # @param begin_date [Date] start of the inschrijving period (no end date)
    # @return [RepertoriumResult]
    def call(insz, referte: SecureRandom.uuid, now: Time.now.in_time_zone(TIME_ZONE), begin_date: Date.current)
      response = call_dienst(inhoud_xml(insz, begin_date), referte:, now:)
      RepertoriumResult.from_xml(response.xml, http_status: response.http.code, referte:)
    rescue StandardError => e
      RepertoriumResult.service_error(e, referte:)
    end

    private

    def inhoud_xml(insz, begin_date)
      <<~XML.strip
        <Inschrijving>
          <Identificatie>#{escape(afzender_identificatie)}</Identificatie>
          <Hoedanigheid>#{escape(hoedanigheid)}</Hoedanigheid>
          <INSZ>#{escape(insz)}</INSZ>
          <Periode>
            <Begin>#{begin_date.strftime('%Y-%m-%d')}</Begin>
          </Periode>
        </Inschrijving>
      XML
    end
  end
end
