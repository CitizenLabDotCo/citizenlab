module OmniauthMethods
  class Facebook

    def omniauth_setup
      if tenant.has_feature?('facebook_login')
        env['omniauth.strategy'].options[:client_id] = Tenant.settings("facebook_login", "app_id")
        env['omniauth.strategy'].options[:client_secret] = Tenant.settings("facebook_login", "app_secret")
        env['omniauth.strategy'].options[:info_fields] = "first_name,last_name,email,birthday,education,gender,locale,third_party_id,timezone,age_range,picture.width(640).height(640)"
      end
    end

    def profile_to_user_attrs auth
      user_attrs = {
        first_name: auth.info['first_name'],
        last_name: auth.info['last_name'],
        email: auth.info['email'],
        locale: Tenant.current.closest_locale_to(auth.extra.raw_info.locale)
      }
      gender = auth.extra.raw_info&.gender
      if gender
        user_attrs[:gender] = gender
      else
        Rails.logger.info "Gender was not provided by facebook, auth instance was #{auth}"
      end

      picture = auth&.extra&.raw_info&.picture&.data

      if picture && !picture.is_silhouette
        user_attrs[:remote_avatar_url] = picture.url
      end

      user_attrs
    end
  end
end