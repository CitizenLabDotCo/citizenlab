module OmniauthMethods
  class Google

    # @param [AppConfiguration] configuration
    def omniauth_setup(configuration, env)
      if configuration.has_feature?('google_login')
        env['omniauth.strategy'].options[:client_id] = configuration.settings("google_login", "client_id")
        env['omniauth.strategy'].options[:client_secret] = configuration.settings("google_login", "client_secret")
        env['omniauth.strategy'].options[:image_size] = 640
        env['omniauth.strategy'].options[:image_aspect_ratio] = "square"
      end
    end

    def profile_to_user_attrs(auth)
      user_attrs = {
        first_name: auth.info['first_name'],
        last_name: auth.info['last_name'],
        email: auth.info['email'],
        remote_avatar_url: auth.info['image'],
        gender: auth.extra.raw_info.gender,
        locale: AppConfiguration.instance.closest_locale_to(auth.extra.raw_info.locale)
      }

      # Currently, the only way to detect if the google account
      # does not have an avatar, is by comparison of URL or by
      # checking if the image URL is available.
      if !image_available?(auth.info.image) || [
        'https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/s640-c/photo.jpg'
      ].include?(auth.info.image)
        user_attrs[:remote_avatar_url] = nil
      end

      user_attrs
    end

    def updateable_user_attrs
      [:remote_avatar_url]
    end

    private

    def image_available?(img_url_s)
      img_url = URI.parse(img_url_s)
      req = Net::HTTP.new(img_url.host, img_url.port)
      req.use_ssl = true
      res = req.request_head(img_url.path)
      res.kind_of? Net::HTTPSuccess
    end
  end
end