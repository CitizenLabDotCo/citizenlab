module OmniauthMethods
  class BosaFAS

    include Verification::Methods::BosaFAS

    def profile_to_user_attrs auth
      {}.tap do |info|
        info[:last_name] = auth.info.last_name if auth.info.last_name
        info[:first_name] = auth.info.first_name if auth.info.first_name
      end
    end

    def omniauth_setup tenant, env
      if Verification::VerificationService.new.is_active?(tenant, name)
        host = OmniauthMethods::BosaFAS.new.host

        options = env['omniauth.strategy'].options
        # options[:scope] = [:openid, :profile]
        options[:scope] = [:openid, :profile]
        options[:response_type] = :code
        options[:state] = true
        options[:nonce] = true
        options[:issuer] = "https://#{host}"
        options[:acr_values] = "urn:be:fedict:iam:fas:Level450"
        options[:send_scope_to_token_endpoint] = false
        options[:client_options] = {
          identifier: config[:identifier],
          secret: config[:secret],
          port: 443,
          scheme: 'https',
          host: host,
          authorization_endpoint: '/fas/oauth2/authorize',
          token_endpoint: '/fas/oauth2/access_token',
          userinfo_endpoint: '/fas/oauth2/userinfo',
          redirect_uri: "#{tenant.base_backend_uri}/auth/bosa_fas/callback",
        }
      end
    end

    def host
      case config[:environment]
      when "integration"
        'idp.iamfas.int.belgium.be'
      when "production"
        'idp.iamfas.belgium.be'
      end
    end

    def update_on_sign_in?
      true
    end

    # def unchangeable_attributes
    #   [:first_name, :last_name, :gender, :birthyear]
    # end

    # def unchangeable_custom_fields
    #   [:birthyear, :gender]
    # end
  end

end