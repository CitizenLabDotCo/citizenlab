
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

  def azureactivedirectory_profile_to_user_attrs auth
    {
      locale: Tenant.current.closest_locale_to(auth.extra.raw_info.locale)
    }
  end

  def franceconnect_profile_to_user_attrs auth
    # Todo: Do something smart with the address auth.extra.raw_info.address.formatted
    {
      gender: auth.extra.raw_info.gender,
      locale: Tenant.current.closest_locale_to('fr-FR'),
      birthyear: (Date.parse(auth.extra.raw_info.birthdate)&.year rescue nil)
    }
  end

  def logout_url provider, user
    self.send("#{provider}_logout_url", user)
  end

  def franceconnect_logout_url user
    last_identity = user.identities
      .where(provider: 'franceconnect')
      .order(created_at: :desc)
      .limit(1)
      &.first

    id_token = last_identity.auth_hash.dig('credentials', 'id_token')

    url_params = {
      id_token_hint: id_token,
      post_logout_redirect_uri: FrontendService.new.home_url
    }

    "https://#{franceconnect_host}/api/v1/logout?#{url_params.to_query}"
  end

  def franceconnect_host
    case Tenant.settings("franceconnect_login", "environment")
    when "integration"
      'fcp.integ01.dev-franceconnect.fr'
    when "production"
      'app.franceconnect.gouv.fr'
    end
  end

  def supports_logout? provider
    provider == 'franceconnect'
  end

  private

  def image_available? img_url_s
    img_url = URI.parse(img_url_s)
    req = Net::HTTP.new(img_url.host, img_url.port)
    req.use_ssl = true
    res = req.request_head(img_url.path)
    res.code != '404'
  end



end