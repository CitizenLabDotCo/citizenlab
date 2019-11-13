module OmniauthMethods
  class AzureActiveDirectory

    def omniauth_setup tenant, env
      if tenant.has_feature?('azure_ad_login')
        env['omniauth.strategy'].options[:client_id] = Tenant.settings("azure_ad_login", "client_id")
        env['omniauth.strategy'].options[:tenant] = Tenant.settings("azure_ad_login", "tenant")
      end
    end

    def profile_to_user_attrs auth
      {
        locale: Tenant.current.closest_locale_to(auth.extra.raw_info.locale)
      }
    end
  end
end