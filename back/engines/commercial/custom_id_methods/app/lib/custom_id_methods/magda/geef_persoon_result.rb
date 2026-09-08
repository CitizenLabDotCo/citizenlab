# frozen_string_literal: true

module CustomIdMethods::Magda
  # Parsed outcome of one MAGDA GeefPersoon call.
  #
  # Keeps only what the residency check needs (postcode, NIS code, birth date)
  # plus the MAGDA uitzonderingen. It never keeps the INSZ or the name.
  #
  # MAGDA signals problems on three levels:
  # 1. a SOAP Fault (request rejected before processing),
  # 2. `Repliek/Uitzonderingen` (authorisation or context problem, no `Antwoorden`),
  # 3. `Repliek/Antwoorden/Antwoord/Uitzonderingen` (problem with this INSZ).
  class GeefPersoonResult
    # Level-3 codes that mean: this INSZ does not resolve to a person in the Rijksregister.
    # See https://vlaamseoverheid.atlassian.net/wiki/spaces/MG/pages/1149436326
    NO_MATCH_CODES = %w[20002 30001 30002 30003 40101 40200].freeze
    # Level-3 codes that mean: the person is not registered in the MAGDA repertorium
    # yet (fix with RegistreerInschrijvingClient, then ask again).
    NOT_REGISTERED_CODES = %w[13202 40003].freeze

    attr_reader :status, :postal_code, :nis_code, :birth_date_string, :uitzonderingen,
      :error_message, :http_status, :referte, :raw_xml

    def self.from_xml(xml, http_status: 200, referte: nil)
      doc = Nokogiri::XML(xml.to_s)
      doc.remove_namespaces!

      uitzonderingen = Uitzondering.from_doc(doc)
      common = { uitzonderingen:, http_status:, referte:, raw_xml: xml.to_s }

      if (fault = doc.at_xpath('//Fault'))
        return new(status: :error, error_message: "SOAP fault: #{text(fault, 'faultstring')}", **common)
      end

      if (persoon = doc.at_xpath('//Repliek/Antwoorden/Antwoord/Inhoud/Persoon'))
        # 02.00 nests the address fields under Gemeente; 02.02 has them flat.
        return new(
          status: :found,
          postal_code: text(persoon, 'Adressen/Hoofdverblijfplaats/Gemeente/PostCode') ||
                       text(persoon, 'Adressen/Hoofdverblijfplaats/Postcode'),
          nis_code: text(persoon, 'Adressen/Hoofdverblijfplaats/Gemeente/NISCode') ||
                    text(persoon, 'Adressen/Hoofdverblijfplaats/NISCodeGemeente'),
          birth_date_string: text(persoon, 'Geboorte/Datum'),
          **common
        )
      end

      if uitzonderingen.any? { |u| NOT_REGISTERED_CODES.include?(u.code) }
        return new(status: :not_registered, **common)
      end

      if uitzonderingen.any? { |u| NO_MATCH_CODES.include?(u.code) }
        return new(status: :not_found, **common)
      end

      message = uitzonderingen.map(&:to_s).join('; ').presence
      message ||= http_status.to_i == 200 ? 'Unexpected response without Persoon or Uitzondering' : "HTTP #{http_status}"
      new(status: :error, error_message: message, **common)
    end

    def self.service_error(error, referte: nil)
      new(status: :error, error_message: "#{error.class}: #{error.message}", referte:)
    end

    def self.text(node, xpath)
      node.at_xpath(xpath)&.text&.strip.presence
    end
    private_class_method :text

    def initialize(status:, postal_code: nil, nis_code: nil, birth_date_string: nil, uitzonderingen: [],
      error_message: nil, http_status: nil, referte: nil, raw_xml: nil)
      @status = status
      @postal_code = postal_code
      @nis_code = nis_code
      @birth_date_string = birth_date_string
      @uitzonderingen = uitzonderingen
      @error_message = error_message
      @http_status = http_status
      @referte = referte
      @raw_xml = raw_xml
    end

    def found?
      status == :found
    end

    def not_found?
      status == :not_found
    end

    def not_registered?
      status == :not_registered
    end

    def error?
      status == :error
    end

    # The latest possible birth date. MAGDA can return an incomplete date
    # (`jjjj-mm-00` or `jjjj-00-00`); the unknown parts resolve to the end of
    # the known period, so an age check stays on the strict side.
    def birth_date
      return nil if birth_date_string.blank?

      year, month, day = birth_date_string.split('-').map(&:to_i)
      return nil if year.nil? || year.zero?

      month = 12 if month.nil? || month.zero?
      day = Date.new(year, month, -1).day if day.nil? || day.zero?
      Date.new(year, month, day)
    rescue Date::Error
      nil
    end

    def uitzondering_codes
      uitzonderingen.filter_map(&:code)
    end
  end
end
