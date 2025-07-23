# frozen_string_literal: true

module IdRmUnify
  class RmUnifyOmniauth < OmniauthMethods::Base
    include RmUnifyVerification

    # NOTE: There are two metadata URLs, one for RM Unify and one for Glow (Scottish schools only).
    # We have only currently implemented the glow one
    GLOW_METADATA_URL = 'https://sts.platform.rmunify.com/SAMLMetadata/RMUnifyGlow.xml'

    def profile_to_user_attrs(auth)
      unique_code   = auth['uid'] # NOTE: No email so we identify a user by unique code
      first_name    = auth.extra.raw_info['urn:oid:2.5.4.42']
      last_name     = auth.extra.raw_info['urn:oid:2.5.4.4']
      locale = AppConfiguration.instance.settings.dig('core', 'locales').first # Should usually be 'en-GB'

      {
        first_name: first_name,
        last_name: last_name,
        unique_code: unique_code,
        locale: locale
      }
    end

    def filter_auth_to_persist(auth)
      auth_to_persist = auth.deep_dup
      auth_to_persist.tap { |h| h[:extra].delete(:response_object) }
    end

    def omniauth_setup(configuration, env)
      return unless Verification::VerificationService.new.active?(configuration, name)

      idp_metadata = OneLogin::RubySaml::IdpMetadataParser.new.parse_remote_to_hash(GLOW_METADATA_URL)
      metadata = idp_metadata.merge(
        assertion_consumer_service_url: redirect_uri(configuration),
        sp_entity_id: issuer,
        idp_slo_service_url: logout_path,
        skip_subject_confirmation: true # Needed to avoid Subject confirmation data error
      )

      env['omniauth.strategy'].options.merge!(metadata)
    end

    def updateable_user_attrs
      super + %i[custom_field_values]
    end

    def locked_custom_fields
      []
    end

    def locked_attributes
      []
    end

    # # TODO: Not sure this will work - see what is done in FranceConnect etc
    # Using logout_path for now
    # def logout_url(_user)
    #   URI.join(Frontend::UrlService.new.home_url, '/auth/rm_unify/spslo').to_s
    # end

    def email_always_present?
      false
    end

    def verification_prioritized?
      true
    end

    def email_confirmed?(_auth)
      false
    end

    private

    def issuer
      Rails.env.development? ? 'https://www.govocal.com/rm_unify' : URI.join(Frontend::UrlService.new.home_url, '/rm_unify').to_s
    end

    def redirect_uri(_configuration)
      "#{host}/auth/rm_unify/callback"
    end

    def logout_path
      host.to_s
    end

    def host
      Rails.env.development? ? 'http://localhost:3000' : AppConfiguration.instance.base_backend_uri
    end
  end
end
