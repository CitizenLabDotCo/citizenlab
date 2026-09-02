# frozen_string_literal: true

module CustomIdMethods::Magda
  # Parsed outcome of a Repertorium.RegistreerInschrijving/RegistreerUitschrijving call.
  # `Resultaat` 1 means "wel geslaagd", 0 means "niet geslaagd" (then MAGDA also
  # returns an Uitzondering).
  class RepertoriumResult
    attr_reader :status, :resultaat, :uitzonderingen, :error_message, :http_status, :referte, :raw_xml

    def self.from_xml(xml, http_status: 200, referte: nil)
      doc = Nokogiri::XML(xml.to_s)
      doc.remove_namespaces!

      uitzonderingen = Uitzondering.from_doc(doc)
      common = { uitzonderingen:, http_status:, referte:, raw_xml: xml.to_s }

      if (fault = doc.at_xpath('//Fault'))
        faultstring = fault.at_xpath('faultstring')&.text&.strip
        return new(status: :error, error_message: "SOAP fault: #{faultstring}", **common)
      end

      resultaat = doc.at_xpath('//Repliek/Antwoorden/Antwoord/Inhoud/Resultaat')&.text&.strip
      if resultaat == '1'
        new(status: :ok, resultaat:, **common)
      else
        message = uitzonderingen.map(&:to_s).join('; ').presence
        message ||= "Resultaat #{resultaat}" if resultaat
        message ||= http_status.to_i == 200 ? 'Unexpected response without Resultaat' : "HTTP #{http_status}"
        new(status: :failed, resultaat:, error_message: message, **common)
      end
    end

    def self.service_error(error, referte: nil)
      new(status: :error, error_message: "#{error.class}: #{error.message}", referte:)
    end

    def initialize(status:, resultaat: nil, uitzonderingen: [], error_message: nil, http_status: nil, referte: nil, raw_xml: nil)
      @status = status
      @resultaat = resultaat
      @uitzonderingen = uitzonderingen
      @error_message = error_message
      @http_status = http_status
      @referte = referte
      @raw_xml = raw_xml
    end

    def ok?
      status == :ok
    end

    def error?
      status != :ok
    end

    def uitzondering_codes
      uitzonderingen.filter_map(&:code)
    end
  end
end
