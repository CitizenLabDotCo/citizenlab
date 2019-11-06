module OmniauthMethods
  class FranceConnect
    def profile_to_user_attrs auth
      # Todo: Do something smart with the address auth.extra.raw_info.address.formatted
      {
        last_name: auth.info['last_name'].titleize, # FC returns last names in ALL CAPITALS
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
        post_logout_redirect_uri: Frontend::UrlService.new.home_url
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

    def update_on_sign_in?
      true
    end

    def unchangeable_attributes
      [:first_name, :last_name, :gender, :birthyear]
    end

    def unchangeable_custom_fields
      [:birthyear, :gender]
    end
  end
end