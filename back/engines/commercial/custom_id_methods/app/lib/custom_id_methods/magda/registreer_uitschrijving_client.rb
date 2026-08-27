# frozen_string_literal: true

module CustomIdMethods::Magda
  # Client for MAGDA Repertorium.RegistreerUitschrijving-02.00: removes a person
  # (INSZ) from the MAGDA repertorium again. Not used in the ACM verification
  # flow; needed for the MAGDA acceptance tests and for cleanup.
  # See BaseClient for the transport details.
  class RegistreerUitschrijvingClient < BaseClient
    NAMESPACE = 'http://webservice.registreeruitschrijvingdienst-02_00.repertorium-02_00.vip.vlaanderen.be'
    DIENST_NAAM = 'RegistreerUitschrijving'

    CONFIG_KEYS = (BASE_CONFIG_KEYS + %i[magda_uitschrijving_endpoint]).freeze

    # @param config [Hash] the ACM id method config (symbol keys)
    def self.from_config(config)
      new(
        endpoint: config[:magda_uitschrijving_endpoint],
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
    # @return [RepertoriumResult]
    def call(insz, referte: SecureRandom.uuid, now: Time.now.in_time_zone(TIME_ZONE))
      response = call_dienst(inhoud_xml(insz), referte:, now:)
      RepertoriumResult.from_xml(response.xml, http_status: response.http.code, referte:)
    rescue StandardError => e
      RepertoriumResult.service_error(e, referte:)
    end

    private

    def inhoud_xml(insz)
      <<~XML.strip
        <Uitschrijving>
          <Identificatie>#{escape(afzender_identificatie)}</Identificatie>
          <Hoedanigheid>#{escape(hoedanigheid)}</Hoedanigheid>
          <INSZ>#{escape(insz)}</INSZ>
        </Uitschrijving>
      XML
    end
  end
end
