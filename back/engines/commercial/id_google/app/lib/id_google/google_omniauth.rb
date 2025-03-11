# frozen_string_literal: true

module IdGoogle
  class GoogleOmniauth < IdMethod::Base
    include IdMethod::OmniAuthMethod

    GOOGLE_PLACEHOLDER_AVATAR_URL = 'https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/s640-c/photo.jpg'

    # @param [AppConfiguration] configuration
    def omniauth_setup(configuration, env)
      return unless configuration.feature_activated?('google_login')

      env['omniauth.strategy'].options[:client_id] = configuration.settings('google_login', 'client_id')
      env['omniauth.strategy'].options[:client_secret] = configuration.settings('google_login', 'client_secret')
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
