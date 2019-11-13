class AuthenticationService

  ALL_METHODS = {
    'facebook' => OmniauthMethods::Facebook.new,
    'google' => OmniauthMethods::Google.new,
    'azureactivedirectory' => OmniauthMethods::AzureActiveDirectory.new,
    'franceconnect' => OmniauthMethods::FranceConnect.new,
  }

  def all_methods
    ALL_METHODS
  end

  def profile_to_user_attrs auth
    provider = auth.provider
    all_methods[provider].profile_to_user_attrs(auth)
  end

  def method_by_provider provider
    all_methods[provider]
  end

  def logout_url provider, user
    omniauth_method = helper(provider)
    if supports_logout?(provider)
      omniauth_method.logout_url(user)
    else
      nil
    end
  end

  def supports_logout? provider
    method_by_provider(provider).respond_to? :logout_url
  end

  def update_on_sign_in? provider
    method_by_provider(provider).respond_to?(:update_on_sign_in?) && method_by_provider(provider).update_on_sign_in?
  end

  # Some providers don't allow users to manually change certain properties,
  # meaning they can't override values coming from the provider. This returns
  # all the properties that users can't manually change for the given user
  def attributes_user_cant_change user
    providers = user&.identities&.pluck(:provider)&.uniq || []
    attributes = providers.flat_map do |provider| 
      omniauth_method = method_by_provider(provider)
      if omniauth_method.respond_to? :unchangeable_attributes
        omniauth_method.unchangeable_attributes
      else
        []
      end
    end
    attributes.uniq
  end

  def custom_fields_user_cant_change user
    providers = user&.identities&.pluck(:provider)&.uniq || []
    custom_fields = providers.flat_map do |provider| 
      omniauth_method = method_by_provider(provider)
      if omniauth_method.respond_to? :unchangeable_custom_fields
        omniauth_method.unchangeable_custom_fields
      else
        []
      end
    end
    custom_fields.uniq
  end

  private

end