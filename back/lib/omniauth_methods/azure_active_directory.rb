# frozen_string_literal: true

module OmniauthMethods
  class AzureActiveDirectory < IdMethod::Base
    include IdMethod::OmniAuthMethod
    # @param [AppConfiguration] configuration
    def omniauth_setup(configuration, env)
      return unless configuration.feature_activated?('azure_ad_login')

      env['omniauth.strategy'].options[:client_id] = configuration.settings('azure_ad_login', 'client_id')
      env['omniauth.strategy'].options[:tenant] = configuration.settings('azure_ad_login', 'tenant')
    end

    def profile_to_user_attrs(auth)
      {
        first_name: auth.info['first_name'],
        last_name: auth.info['last_name'],
        email: auth.info['email'],
        remote_avatar_url: remote_avatar_url(auth),
        locale: AppConfiguration.instance.closest_locale_to(auth.extra.raw_info.locale)
      }
    end

    private

    def remote_avatar_url(auth)
      return unless AppConfiguration.instance.feature_activated?('user_avatars')

      auth.info['image']
    end
  end

  def updateable_user_attrs
    super + %i[remote_avatar_url]
  end
end
