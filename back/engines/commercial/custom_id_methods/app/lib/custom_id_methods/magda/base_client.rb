# frozen_string_literal: true

require 'savon'

module CustomIdMethods::Magda
  # Shared plumbing for the MAGDA SOAP diensten (Persoon.GeefPersoon,
  # Repertorium.RegistreerInschrijving, Repertorium.RegistreerUitschrijving).
  #
  # - Two-way TLS with the DCBaaS application certificate of the municipality
  #   (the municipality is the verwerkingsverantwoordelijke, Go Vocal the verwerker).
  # - WS-Security signature of the SOAP body with the same certificate
  #   (RSA-SHA1, exclusive C14N, X509v3 BinarySecurityToken). MAGDA rejects
  #   unsigned requests ("ERR_025: Verification failure: No signature in
  #   message!"), so requests are always signed; `sign: false` only exists for
  #   diagnostics from specs.
  # - The dienst namespace is declared with a prefix (`<ns:GeefPersoon><Verzoek>`),
  #   like MAGDA's own "werkend request" example. MAGDA's bron adapter rejects
  #   the XSD-equivalent `<Verzoek xmlns="">` form with a misleading
  #   "99994 Onverwachte fout bij de bron".
  # - No WSDL at runtime (it sits behind mTLS as well); the envelope follows the
  #   official request template and XSD's.
  #
  # The configuration mirrors the parameters in MAGDA's aansluitingsmail:
  # `magda_uri` = "URI (identifier)", `magda_hoedanigheidscode` =
  # "Hoedanigheidscodes", and `magda_environment` selects the fixed endpoints
  # (production, or tni for the test environment with the -aip hosts).
  #
  # Subclasses define NAMESPACE, DIENST_NAAM, ENDPOINTS (and optionally VERSIE)
  # and build their own `Inhoud`.
  class BaseClient
    VERSIE = '02.00.0000' # subclasses can override (GeefPersoon runs on 02.02)
    TIME_ZONE = 'Europe/Brussels'
    OPEN_TIMEOUT = 5
    READ_TIMEOUT = 15

    ENVIRONMENTS = %w[production tni].freeze
    CONFIG_KEYS = %i[magda_certificate magda_private_key magda_uri].freeze

    attr_reader :environment, :uri, :hoedanigheidscode, :sign

    # @param config [Hash] the ACM id method config (symbol keys)
    def self.from_config(config)
      new(
        environment: config[:magda_environment].presence || 'production',
        certificate: config[:magda_certificate],
        private_key: config[:magda_private_key],
        uri: config[:magda_uri],
        hoedanigheidscode: config[:magda_hoedanigheidscode]
      )
    end

    def self.configured?(config)
      config.present? && CONFIG_KEYS.all? { |key| config[key].present? }
    end

    def initialize(environment:, certificate:, private_key:, uri:, hoedanigheidscode: nil, sign: true)
      @environment = environment
      @certificate = certificate
      @private_key = private_key
      @uri = uri
      @hoedanigheidscode = hoedanigheidscode
      @sign = sign
    end

    def endpoint
      self.class::ENDPOINTS.fetch(environment) do
        raise ArgumentError, "Unknown MAGDA environment #{environment.inspect} for #{self.class.name} (expected one of #{ENVIRONMENTS.join(', ')})"
      end
    end

    # The `Verzoek` element, inserted by Savon inside `<ns:DienstNaam>`.
    # Public so that specs and the probe rake tasks can inspect it.
    def verzoek_xml(inhoud_xml:, referte:, now:)
      hoedanigheid_xml = hoedanigheidscode.present? ? "<Hoedanigheid>#{escape(hoedanigheidscode)}</Hoedanigheid>" : ''
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
                <Identificatie>#{escape(uri)}</Identificatie>
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
        soap_action: '',
        message: verzoek_xml(inhoud_xml:, referte:, now:)
      )
    end

    def savon_client
      @savon_client ||= Savon.client(**savon_options)
    end

    def savon_options
      options = {
        endpoint: endpoint,
        namespace: self.class::NAMESPACE,
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
