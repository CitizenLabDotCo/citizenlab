# frozen_string_literal: true

module CustomIdMethods::Magda
  # Client for MAGDA Persoon.GeefPersoon-02.02 (Rijksregister lookup by INSZ).
  # See BaseClient for the transport and configuration details.
  #
  # Note: the person must be registered in the MAGDA repertorium first
  # (RegistreerInschrijvingClient); an unregistered INSZ answers with
  # uitzondering 13202 or 40003 (`GeefPersoonResult#not_registered?`).
  class GeefPersoonClient < BaseClient
    NAMESPACE = 'http://magda.vlaanderen.be/persoon/soap/geefpersoon/v02_02'
    DIENST_NAAM = 'GeefPersoon'
    VERSIE = '02.02.0000'

    ENDPOINTS = {
      'production' => 'https://magdapersoondienst.vlaanderen.be/GeefPersoonDienst-02.02/soap/WebService',
      'tni' => 'https://magdapersoondienst-aip.vlaanderen.be/GeefPersoonDienst-02.02/soap/WebService'
    }.freeze

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
