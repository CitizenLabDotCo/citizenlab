# frozen_string_literal: true

module CustomIdMethods::Facebook
  class FacebookOmniauth < IdMethods::Base
    def name
      'facebook'
    end

    def verification?
      false
    end

    def authentication?
      true
    end

    def verification_method_type
      :omniauth
    end

    def id
      'd6158130-5752-483f-83fb-ccf24beceaf5'
    end

    def config_parameters
      %i[app_id app_secret]
    end

    def config_parameters_schema
      {
        app_id: {
          title: 'App ID',
          type: 'string'
        },
        app_secret: {
          title: 'App Secret',
          type: 'string',
          private: true
        }
      }
    end

    # Exposed publicly via the /id_methods endpoint. app_id is public
    # information (it appears in the OpenGraph `fb:app_id` meta tag and Messenger
    # share links); app_secret is intentionally not exposed.
    def exposed_config_parameters
      %i[app_id]
    end

    # @param [AppConfiguration] configuration
    def omniauth_setup(configuration, env)
      return unless IdMethodService.new.configured?(configuration, name)

      env['omniauth.strategy'].options[:client_id] = config[:app_id]
      env['omniauth.strategy'].options[:client_secret] = config[:app_secret]
      env['omniauth.strategy'].options[:info_fields] = 'first_name,last_name,email,birthday,education,gender,locale,third_party_id,timezone,age_range,picture.width(640).height(640)'
    end

    def profile_to_user_attrs(auth)
      user_attrs = {
        first_name: auth.info['first_name'],
        last_name: auth.info['last_name'],
        email: auth.info['email'],
        locale: AppConfiguration.instance.closest_locale_to(auth.extra.raw_info.locale),
        remote_avatar_url: remote_avatar_url(auth)
      }

      gender = auth.extra.raw_info&.gender
      if gender
        user_attrs[:gender] = gender
      else
        Rails.logger.info "Gender was not provided by facebook, auth instance was #{auth}"
      end

      user_attrs
    end

    def updateable_user_attrs
      super + %i[remote_avatar_url]
    end

    private

    def remote_avatar_url(auth)
      return unless AppConfiguration.instance.feature_activated?('user_avatars')

      raw_info = auth&.extra&.raw_info
      picture = raw_info&.picture&.data
      picture.url if picture && !picture.is_silhouette
    end
  end
end
