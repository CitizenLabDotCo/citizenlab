class SingleSignOnService

  @@provider_helpers = {
    'facebook' => OmniauthMethods::Facebook.new,
    'google' => OmniauthMethods::Google.new,
    'azureactivedirectory' => OmniauthMethods::AzureActiveDirectory.new,
    'franceconnect' => OmniauthMethods::FranceConnect.new,
    'bosa_fas' => OmniauthMethods::BosaFAS.new,
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
    @@provider_helpers[provider] || raise("Unsupported provider #{provider}")
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

  def update_on_sign_in? provider
    helper(provider).respond_to?(:update_on_sign_in?) && helper(provider).update_on_sign_in?
  end

  # Some providers don't allow users to manually change certain properties,
  # meaning they can't override values coming from the provider. This returns
  # all the properties that users can't manually change for the given user
  def attributes_user_cant_change user
    providers = user&.identities&.pluck(:provider)&.uniq || []
    attributes = providers.flat_map do |provider| 
      provider_helper = helper(provider)
      if provider_helper.respond_to? :unchangeable_attributes
        provider_helper.unchangeable_attributes
      else
        []
      end
    end
    attributes.uniq
  end

  def custom_fields_user_cant_change user
    providers = user&.identities&.pluck(:provider)&.uniq || []
    custom_fields = providers.flat_map do |provider| 
      provider_helper = helper(provider)
      if provider_helper.respond_to? :unchangeable_custom_fields
        provider_helper.unchangeable_custom_fields
      else
        []
      end
    end
    custom_fields.uniq
  end

  private

end