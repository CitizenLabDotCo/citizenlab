# frozen_string_literal: true

module OmniauthMethods
  class AzureActiveDirectory < OmniauthMethods::Base
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
        email: nil, # auth.info['email'],
        remote_avatar_url: remote_avatar_url(auth),
        locale: AppConfiguration.instance.closest_locale_to(auth.extra.raw_info.locale)
      }
    end

    def enforced_email_domains
      config = AppConfiguration.instance
      return [] unless config.feature_activated?('azure_ad_login')

      domains_str = config.settings('azure_ad_login', 'enforced_email_domains')
      return [] if domains_str.blank?

      domains_str.split(',').map { |d| d.strip.downcase }.compact_blank
    end

    def email_always_present?
      false
    end

    def email_confirmed?(_auth)
      false
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
