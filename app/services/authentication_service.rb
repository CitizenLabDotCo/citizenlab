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
    auth_method = method_by_provider(provider)
    if supports_logout?(provider)
      auth_method.logout_url(user)
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

end
