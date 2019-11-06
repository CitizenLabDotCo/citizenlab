module OmniauthMethods
  class Facebook
    def profile_to_user_attrs auth
      user_attrs = {
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
      else
        user_attrs[:remote_avatar_url] = nil
      end

      user_attrs
    end
  end
end