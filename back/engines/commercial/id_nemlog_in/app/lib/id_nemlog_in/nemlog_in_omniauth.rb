# frozen_string_literal: true

module IdNemlogIn
  class NemlogInOmniauth < OmniauthMethods::Base
    include NemlogInVerification

    ENVIRONMENTS = {
      pre_production_integration: {
        # https://www.nemlog-in.dk/vejledningertiltestmiljo/forside/test-som-tjenesteudbyder-eller-broker/
        # But the certificates from `production_integration` are used, because the ones from `pre_production_integration` give "Invalid Signature on SAML Response"
        metadata_xml_file: File.join(IdNemlogIn::Engine.root, 'config', 'saml', 'idp_metadata', 'pre_production_integration.xml')
      },
      production_integration: {
        # https://tu.nemlog-in.dk/oprettelse-og-administration-af-tjenester/log-in/dokumentation.og.guides/integrationstestmiljo/
        metadata_xml_file: File.join(IdNemlogIn::Engine.root, 'config', 'saml', 'idp_metadata', 'production_integration.xml')
      },
      production: {
        # https://tu.nemlog-in.dk/oprettelse-og-administration-af-tjenester/log-in/dokumentation.og.guides/produktionsmiljo/
        metadata_xml_file: File.join(IdNemlogIn::Engine.root, 'config', 'saml', 'idp_metadata', 'production.xml')
      }
    }.freeze

    def profile_to_user_attrs(auth)
      # puts auth.extra['response_object'].decrypted_document
      cpr_number = auth.extra.raw_info['https://data.gov.dk/model/core/eid/cprNumber']

      {
        custom_field_values: {
          municipality_code: fetch_municipality_code(cpr_number)
        }
      }
    end

    def omniauth_setup(configuration, env)
      return unless Verification::VerificationService.new.active?(configuration, name)

      verification_config = config

      metadata_file = ENVIRONMENTS.dig(verification_config[:environment].to_sym, :metadata_xml_file)

      idp_metadata_parser = OneLogin::RubySaml::IdpMetadataParser.new
      idp_metadata = idp_metadata_parser.parse_to_hash(File.read(metadata_file))

      metadata = idp_metadata.merge({
        issuer: verification_config[:issuer],

        # without it (or with assertion_consumer_service_url: nil), localtunnel gives "502 Bad Gateway nginx/1.17.9"
        # after clicking "Verify with MitID" on https://nemlogin-k3kd.loca.lt/auth/nemlog_in?token=eyJhbGc...
        # Probably, because the request has a token and so the size of request is too big
        # <samlp:AuthnRequest AssertionConsumerServiceURL='https://nemlogin-k3kd.loca.lt/auth/nemlog_in/callback?token=eyJhbG
        # Nemlog-in also fails without this line.
        assertion_consumer_service_url: callback_uri(configuration),

        # certificate: verification_config[:certificate], # not required as it's used in our SP metadata file, which is uploaded to NemLog-in
        private_key: verification_config[:private_key], # should start with "-----BEGIN PRIVATE KEY-----". "Bag Attributes" part should be removed
        # Transform `token` param to `RelayState`, which is preserved by SAML.
        # Nemlog-in gives error if it's longer than 512 chars.
        # idp_sso_target_url_runtime_params: { token: :RelayState },

        security: {
          authn_requests_signed: true, # using false gives "A technical error has occurred" on https://test-devtest4-nemlog-in.pp.mitid.dk/
          signature_method: 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256'
          # Any of these gives "A technical error has occurred" on https://test-devtest4-nemlog-in.pp.mitid.dk/
          # digest_method: 'http://www.w3.org/2000/09/xmldsig#sha1',
          # signature_method: 'http://www.w3.org/2000/09/xmldsig#rsa-sha1'
        }
      })

      env['omniauth.strategy'].options.merge!(metadata)
    end

    def updateable_user_attrs
      %i[custom_field_values]
    end

    def locked_custom_fields
      %i[municipality_code]
    end

    def locked_attributes
      %i[]
    end

    # Why do we need cookies?
    # The omniauth gem saves our params (token and path) to the session here
    # https://github.com/omniauth/omniauth/blob/a13cd110beb9538ea51be6c614bf43351c3f4e95/lib/omniauth/strategy.rb#L233
    # Then we use both params in Verification::Patches::OmniauthCallbackController.
    #
    # In some omniauth strategies (e.g., OIDC for ClaveUnica), the provider (ClaveUnica)
    # redirects a user to our app via the 302 code. This way, the cookies are passed to our app.
    #
    # But in other strategies (e.g., SAML for Nemlog-in), the provider (Nemlog-in)
    # "redirects" using an html POST form (see below).
    # This way, the cookies are not passed to our app.
    # See:
    # - https://web.dev/samesite-cookie-recipes/#:~:text=primarily%20POST%20requests.-,Cookies%20marked%20as,-SameSite%3DLax%20will
    # - https://citizenlabco.slack.com/archives/C65GX921W/p1695740292043389
    #
    def redirect_callback_to_get_cookies(controller)
      nemlog_in_callback_uri = callback_uri(AppConfiguration.instance)
      # If the request comes from #callback_uri, it means the form below was already submitted
      # which means the previous nemlog_in/callback "redirected" here.
      # It also means that the cookies are present in the current request.
      return false if controller.request.referer.nil? || controller.request.referer.include?(nemlog_in_callback_uri)

      controller.request.session_options[:skip] = true # without this line, session is overwritten with a new (almost empty) one

      # We cannot use redirect_to, because SAMLResponse can be many kilobytes long,
      # and so doesn't fit into a GET response for many web servers.
      # Nemlog-in uses the same form to "redirect" to our app.
      # rubocop:disable Rails/OutputSafety
      controller.render html: <<-HTML.html_safe
        <form action="#{nemlog_in_callback_uri}" method="post">
          <div>
            <input type="hidden" name="RelayState" value="#{controller.params['RelayState']}"/>
            <input type="hidden" name="SAMLResponse" value="#{controller.params['SAMLResponse']}"/>
          </div>
        </form>
        <script>
          window.addEventListener('DOMContentLoaded', function() {
            document.forms[0].submit()
          })
        </script>
      HTML
      # rubocop:enable Rails/OutputSafety

      true
    end

    def logout_url; end

    private

    def fetch_municipality_code(cpr_number)
      IdNemlogIn::KkiLocationApi.new.municipality_code(cpr_number)
    end

    def callback_uri(configuration)
      "#{configuration.base_backend_uri}/auth/nemlog_in/callback"
    end
  end
end
