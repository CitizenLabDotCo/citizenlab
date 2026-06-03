# frozen_string_literal: true

module CustomIdMethods::Google
  class GoogleOmniauth < IdMethods::Base
    include IdMethods::BaseIdMethod

    GOOGLE_PLACEHOLDER_AVATAR_URL = 'https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/s640-c/photo.jpg'

    # Google is a login-only SSO method. Its configuration lives alongside the
    # verification methods (in `verification.verification_methods`), but it cannot
    # be used to verify user identities.
    def verification?
      false
    end

    def verification_method_type
      :omniauth
    end

    def id
      '1ea7ec6a-2647-4f85-bc40-dba704cc82e2'
    end

    def name
      'google'
    end

    def config_parameters
      %i[client_id client_secret]
    end

    def config_parameters_schema
      {
        client_id: {
          title: 'Client ID',
          type: 'string'
        },
        client_secret: {
          title: 'Client Secret',
          type: 'string',
          private: true
        }
      }
    end

    # @param [AppConfiguration] configuration
    def omniauth_setup(configuration, env)
      return unless IdMethodService.new.configured?(configuration, name)

      env['omniauth.strategy'].options[:client_id] = config[:client_id]
      env['omniauth.strategy'].options[:client_secret] = config[:client_secret]
      env['omniauth.strategy'].options[:image_size] = 640
      env['omniauth.strategy'].options[:image_aspect_ratio] = 'square'
    end

    # @param [OmniAuth::AuthHash] auth
    def profile_to_user_attrs(auth)
      {
        first_name: auth.info['first_name'],
        last_name: auth.info['last_name'],
        email: auth.info['email'],
        remote_avatar_url: remote_avatar_url(auth),
        gender: auth.extra.raw_info.gender,
        locale: AppConfiguration.instance.closest_locale_to(auth.extra.raw_info.locale)
      }
    end

    def updateable_user_attrs
      super + %i[remote_avatar_url]
    end

    def email_confirmed?(auth)
      auth.extra.raw_info.email_verified
    end

    private

    def remote_avatar_url(auth)
      return unless AppConfiguration.instance.feature_activated?('user_avatars')
      return if auth.info.image == GOOGLE_PLACEHOLDER_AVATAR_URL
      return unless image_available?(auth.info.image)

      auth.info.image
    end

    def image_available?(img_url_s)
      img_url = URI.parse(img_url_s)
      req = Net::HTTP.new(img_url.host, img_url.port)
      req.use_ssl = true
      res = req.request_head(img_url.path)
      res.is_a? Net::HTTPSuccess
    end
  end
end
