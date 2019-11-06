module OmniauthMethods
  class AzureActiveDirectory
    def profile_to_user_attrs auth
      {
        locale: Tenant.current.closest_locale_to(auth.extra.raw_info.locale)
      }
    end
  end
end