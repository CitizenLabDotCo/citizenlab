# frozen_string_literal: true

require 'savon'

module CustomIdMethods::Magda
  # Shared plumbing for the MAGDA 02.00 SOAP diensten (Persoon.GeefPersoon,
  # Repertorium.RegistreerInschrijving, Repertorium.RegistreerUitschrijving).
  #
  # - Two-way TLS with the DCBaaS application certificate of the municipality
  #   (the municipality is the verwerkingsverantwoordelijke, Go Vocal the verwerker).
  # - WS-Security signature of the SOAP body with the same certificate
  #   (RSA-SHA1, exclusive C14N, X509v3 BinarySecurityToken), which is what the
  #   MAGDA reference connector does. The MAGDA reverse proxy rejects unsigned
  #   requests with "ERR_025: Verification failure: No signature in message!",
  #   so signing is on by default; `sign: false` only exists for diagnostics.
  # - No WSDL at runtime (it sits behind mTLS as well); the envelope follows the
  #   official request template and the 02.00 XSD's.
  #
  # Subclasses define NAMESPACE, DIENST_NAAM (and optionally VERSIE) and build
  # their own `Inhoud`.
  class BaseClient
    VERSIE = '02.00.0000' # subclasses can override (GeefPersoon runs on 02.02)
    TIME_ZONE = 'Europe/Brussels'
    OPEN_TIMEOUT = 5
    READ_TIMEOUT = 15

    BASE_CONFIG_KEYS = %i[magda_certificate magda_private_key magda_afzender_identificatie].freeze

    attr_reader :endpoint, :afzender_identificatie, :hoedanigheid, :sign

    def initialize(endpoint:, certificate:, private_key:, afzender_identificatie:, hoedanigheid: nil, sign: true)
      @endpoint = endpoint
      @certificate = certificate
      @private_key = private_key
      @afzender_identificatie = afzender_identificatie
      @hoedanigheid = hoedanigheid
      @sign = sign
    end

    # The `Verzoek` element, inserted by Savon inside `<ns:DienstNaam>`.
    # Public so that specs and the probe rake tasks can inspect it.
    def verzoek_xml(inhoud_xml:, referte:, now:)
      hoedanigheid_xml = hoedanigheid.present? ? "<Hoedanigheid>#{escape(hoedanigheid)}</Hoedanigheid>" : ''
      <<~XML.strip
        <Verzoek>
          <Context>
            <Naam>#{self.class::DIENST_NAAM}</Naam>
            <Versie>#{self.class::VERSIE}</Versie>
            <Bericht>
              <Type>VRAAG</Type>
              <Tijdstip>
                <Datum>#{now.strftime('%Y-%m-%d')}</Datum>
                <Tijd>#{now.strftime('%H:%M:%S')}.000</Tijd>
              </Tijdstip>
              <Afzender>
                <Identificatie>#{escape(afzender_identificatie)}</Identificatie>
                <Referte>#{escape(referte)}</Referte>
                #{hoedanigheid_xml}
              </Afzender>
            </Bericht>
          </Context>
          <Vragen>
            <Vraag>
              <Referte>#{escape(referte)}</Referte>
              <Inhoud>
                #{inhoud_xml}
              </Inhoud>
            </Vraag>
          </Vragen>
        </Verzoek>
      XML
        .gsub(/^[ \t]*\n/, '')
    end

    private

    def call_dienst(inhoud_xml, referte:, now:)
      savon_client.call(
        self.class::DIENST_NAAM.underscore.to_sym,
        message_tag: self.class::DIENST_NAAM,
        soap_action: soap_action,
        message: verzoek_xml(inhoud_xml:, referte:, now:)
      )
    end

    # The MAGDA reference connector sends an empty SOAPAction. The WSDL's declare
    # e.g. "GeefPersoonDienst-02.02"; MAGDA_SOAPACTION overrides for diagnostics.
    def soap_action
      (Rails.env.local? && ENV.fetch('MAGDA_SOAPACTION', nil)) || ''
    end

    def savon_client
      @savon_client ||= Savon.client(**savon_options)
    end

    def savon_options
      options = {
        endpoint: endpoint,
        namespace: self.class::NAMESPACE,
        # Prefixed namespace (<ns:GeefPersoon><Verzoek>...), like the official
        # "werkend request" example. MAGDA asked (27/08) to drop the xmlns=""
        # reset that a default namespace on the Envelope would require.
        namespace_identifier: :ns,
        env_namespace: :soapenv,
        soap_version: 1,
        raise_errors: false, # faults and HTTP errors are parsed into result objects
        ssl_verify_mode: :peer,
        ssl_cert: OpenSSL::X509::Certificate.new(@certificate),
        ssl_cert_key: OpenSSL::PKey::RSA.new(@private_key),
        open_timeout: OPEN_TIMEOUT,
        read_timeout: READ_TIMEOUT,
        # MAGDA_DEBUG=1 prints the exact request (incl. WS-Security signature and
        # INSZ) and response on stdout. Diagnostics from the rake probes only;
        # never enable in production.
        log: Rails.env.local? && ENV['MAGDA_DEBUG'] == '1',
        logger: Logger.new($stdout),
        log_level: :debug,
        pretty_print_xml: false
      }
      options[:wsse_signature] = wsse_signature if sign
      options
    end

    def wsse_signature
      certs = Akami::WSSE::Certs.new(cert_string: @certificate, private_key_string: @private_key)
      Akami::WSSE::Signature.new(certs)
    end

    def escape(value)
      CGI.escapeHTML(value.to_s)
    end
  end
end
