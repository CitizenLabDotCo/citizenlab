# frozen_string_literal: true

module CustomIdMethods::Magda
  # Client for MAGDA Repertorium.RegistreerUitschrijving-02.00: removes a person
  # (INSZ) from the MAGDA repertorium again. Not used in the ACM verification
  # flow; needed for the MAGDA acceptance tests and for cleanup.
  # See BaseClient for the transport details.
  class RegistreerUitschrijvingClient < BaseClient
    NAMESPACE = 'http://webservice.registreeruitschrijvingdienst-02_00.repertorium-02_00.vip.vlaanderen.be'
    DIENST_NAAM = 'RegistreerUitschrijving'

    ENDPOINTS = {
      'production' => 'https://magdarepertoriumdienst.vlaanderen.be/RegistreerUitschrijvingDienst-02.00/soap/WebService',
      'tni' => 'https://magdarepertoriumdienst-aip.vlaanderen.be/RegistreerUitschrijvingDienst-02.00/soap/WebService'
    }.freeze

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
          <Identificatie>#{escape(uri)}</Identificatie>
          <Hoedanigheid>#{escape(hoedanigheidscode)}</Hoedanigheid>
          <INSZ>#{escape(insz)}</INSZ>
        </Uitschrijving>
      XML
    end
  end
end
