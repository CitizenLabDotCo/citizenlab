
class SingleSignOnService


  def profile_to_user_attrs network, auth
    self.send("#{network}_profile_to_user_attrs", auth)
  end

  def facebook_profile_to_user_attrs auth
    user_attrs = {
      locale: Tenant.current.closest_locale_to(auth.extra.raw_info.locale)
    }
    gender = auth.extra.raw_info&.gender
    if gender
      user_attrs[:gender] = gender
    else # don't add gender
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

    # Currently, the only way to detect if the google account
    # does not have an avatar, is by comparison of URL or by
    # checking if the image URL is available.
    if !image_available?(auth.info.image) || [
      'https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/s640-c/photo.jpg',
      'https://lh3.googleusercontent.com/-WCx8qoBI50k/AAAAAAAAAAI/AAAAAAAAAAA/AB6qoq3-Bmls0fR0ufuVUuB9ji2PyIS4-A/mo/s640-c/photo.jpg'
    ].include?(auth.info.image)
      user_attrs[:remote_avatar_url] = nil
    end

    user_attrs
  end

  def image_available? img_url_s
    img_url = URI.parse(img_url_s)
    req = Net::HTTP.new(img_url.host, img_url.port)
    req.use_ssl = true
    res = req.request_head(img_url.path)
    res.code != '404'
  end

  def mydigipass_profile_to_user_attrs auth
    user_attrs = {}

    user_attrs
  end

end