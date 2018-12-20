
class SingleSignOnService

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

  class Google
    def profile_to_user_attrs auth
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
  end

  class AzureActiveDirectory
    def profile_to_user_attrs auth
      {
        locale: Tenant.current.closest_locale_to(auth.extra.raw_info.locale)
      }
    end
  end

  class FranceConnect
    def profile_to_user_attrs auth
      # Todo: Do something smart with the address auth.extra.raw_info.address.formatted
      {
        gender: auth.extra.raw_info.gender,
        locale: Tenant.current.closest_locale_to('fr-FR'),
        birthyear: (Date.parse(auth.extra.raw_info.birthdate)&.year rescue nil)
      }
    end

    def logout_url user
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

      "https://#{host}/api/v1/logout?#{url_params.to_query}"
    end

    def host
      case Tenant.settings("franceconnect_login", "environment")
      when "integration"
        'fcp.integ01.dev-franceconnect.fr'
      when "production"
        'app.franceconnect.gouv.fr'
      end
    end
  end

  @@provider_helpers = {
    'facebook' => Facebook.new,
    'google' => Google.new,
    'azureactivedirectory' => AzureActiveDirectory.new,
    'franceconnect' => FranceConnect.new
  }
  

  def profile_to_user_attrs auth
    provider = auth.provider
    default_user_attrs = {
      first_name: auth.info['first_name'],
      last_name: auth.info['last_name'],
      email: auth.info['email'],
      remote_avatar_url: auth.info['image'],
    }
    custom_user_attrs = @@provider_helpers[provider].profile_to_user_attrs(auth)
    {**default_user_attrs, **custom_user_attrs}
  end

  def helper provider
    @@provider_helpers[provider]
  end

  def logout_url provider, user
    provider_helper = helper(provider)
    if supports_logout?(provider)
      provider_helper.logout_url(user)
    else
      nil
    end
  end


  def supports_logout? provider
    helper(provider).respond_to? :logout_url
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