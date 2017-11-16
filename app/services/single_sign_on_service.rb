
class SingleSignOnService


  def profile_to_user_attrs network, auth
    self.send("#{network}_profile_to_user_attrs", auth)
  end

  def facebook_profile_to_user_attrs auth
    
    user_attrs = {
      gender: auth.extra.raw_info.gender,
      locale: Tenant.current.closest_locale_to(auth.extra.raw_info.locale)
    }

    picture = auth&.extra&.raw_info&.picture&.data

    if picture && !picture.is_silhouette
      user_attrs[:remote_avatar_url] = picture.url
    end

    user_attrs
  end

  def google_profile_to_user_attrs auth
    user_attrs = {
      gender: auth.extra.raw_info.gender,
      locale: Tenant.current.closest_locale_to(auth.extra.raw_info.locale)
    }

    user_attrs
  end

  def mydigipass_profile_to_user_attrs auth
    user_attrs = {
    }

    user_attrs
  end

end