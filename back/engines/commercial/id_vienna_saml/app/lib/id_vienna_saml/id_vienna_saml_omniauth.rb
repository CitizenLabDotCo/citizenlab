module IdViennaSaml
  class IdViennaSamlOmniauth
    # include FranceconnectVerification

    def profile_to_user_attrs(auth)
      # TODO: Do something smart with the address auth.extra.raw_info.address.formatted
      {
        first_name: auth.info['first_name'],
        email: auth.info['email'],
        last_name: auth.info['last_name'].titleize, # FC returns last names in ALL CAPITALS
        locale: AppConfiguration.instance.closest_locale_to('fr-FR'),
        remote_avatar_url: auth.info['image']
      }.tap do |attrs|
        custom_fields = CustomField.with_resource_type('User').enabled.pluck(:code)
        if custom_fields.include?('birthyear')
          attrs[:birthyear] = begin
            Date.parse(auth.extra.raw_info.birthdate)&.year
          rescue StandardError
            nil
          end
        end
        attrs[:gender] = auth.extra.raw_info.gender if custom_fields.include?('gender')
      end
    end

    # @param [AppConfiguration] configuration
    def omniauth_setup(configuration, env)
      return unless configuration.feature_activated?('vienna_login')

      fixed_metadata = {
        issuer: 'CitizenLab',
        # Use Redirect endpoint instead of GET because Vienna support complains about this
        idp_sso_service_url: 'https://pvp.wien.gv.at/stdportal-idp/intern.wien.gv.at/profile/SAML2/Redirect/SSO'
      }

      idp_metadata_parser = OneLogin::RubySaml::IdpMetadataParser.new
      idp_metadata = idp_metadata_parser.parse_to_hash(idp_metadata_xml)

      metadata = idp_metadata.merge(fixed_metadata)

      env['omniauth.strategy'].options.merge!(metadata)
    end

    def logout_url(user)
      # last_identity = user.identities
      #                     .where(provider: 'franceconnect')
      #                     .order(created_at: :desc)
      #                     .limit(1)
      #                   &.first
      # id_token = last_identity.auth_hash.dig('credentials', 'id_token')

      # url_params = {
      #   id_token_hint: id_token,
      #   post_logout_redirect_uri: Frontend::UrlService.new.home_url
      # }

      # "https://#{host}/api/v1/logout?#{url_params.to_query}"
    end

    def updateable_user_attrs
      %i[first_name last_name birthyear remote_avatar_url]
    end

    private

    # @param [AppConfiguration] configuration
    def redirect_uri(configuration)
      "#{configuration.base_backend_uri}/auth/franceconnect/callback"
    end

    def idp_metadata_xml
      File.read(idp_metadata_xml_file)
    end

    def idp_metadata_xml_file
      env = AppConfiguration.instance.settings('vienna_login', 'environment')
      case env
      when 'test'
        File.join(IdViennaSaml::Engine.root, 'config', 'idp_metadata_test.xml')
      when 'production'
        File.join(IdViennaSaml::Engine.root, 'config', 'idp_metadata_production.xml')
      else
        raise "No Idp metadata known for vienna_login env: #{env}"
      end
    end
  end
end
