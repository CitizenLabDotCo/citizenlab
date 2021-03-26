class AuthenticationService

  @all_methods = {
    'facebook' => OmniauthMethods::Facebook.new,
    'google' => OmniauthMethods::Google.new,
    'azureactivedirectory' => OmniauthMethods::AzureActiveDirectory.new,
  }

  class << self
    attr_reader :all_methods

    def add_method name, authentication_method
      @all_methods[name.to_s] = authentication_method
    end
  end

  def all_methods
    self.class.all_methods
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

end
