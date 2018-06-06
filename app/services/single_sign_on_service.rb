
class SingleSignOnService


  def profile_to_user_attrs network, auth
    self.send("#{network}_profile_to_user_attrs", auth)
  end

  def facebook_profile_to_user_attrs auth
    user_attrs = {
      locale: Tenant.current.closest_locale_to(auth.extra.raw_info.locale)
    }
    begin
      gender = auth.extra.raw_info.gender
      user_attrs[:gender] = gender
    rescue Exception => e # don't add gender
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

  def google_profile_to_user_attrs auth
    user_attrs = {
      gender: auth.extra.raw_info.gender,
      locale: Tenant.current.closest_locale_to(auth.extra.raw_info.locale)
    }

    # Currently, every google account without avatar has this URL. Can change
    # in the future, but only way to detect without extra API calls
    if (auth.info.image == 'https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/s640-c/photo.jpg')
      user_attrs[:remote_avatar_url] = nil
    end

    user_attrs
  end

  def mydigipass_profile_to_user_attrs auth
    user_attrs = {}

    user_attrs
  end

end