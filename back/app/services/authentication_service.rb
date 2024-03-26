# frozen_string_literal: true

class AuthenticationService
  @all_methods = {
    'facebook' => OmniauthMethods::Facebook.new,
    'google' => OmniauthMethods::Google.new,
    'azureactivedirectory' => OmniauthMethods::AzureActiveDirectory.new,
    'azureactivedirectory_b2c' => OmniauthMethods::AzureActiveDirectoryB2c.new,
  }

  class << self
    attr_reader :all_methods

    def add_method(name, authentication_method)
      @all_methods[name.to_s] = authentication_method
    end
  end

  def all_methods
    self.class.all_methods
  end

  def method_by_provider(provider)
    all_methods[provider]
  end

  def logout_url(provider, user)
    auth_method = method_by_provider(provider)
    return unless supports_logout?(provider)

    auth_method.logout_url(user)
  end

  def supports_logout?(provider)
    method_by_provider(provider).respond_to? :logout_url
  end

  def prevent_user_account_hijacking(user)
    # When a user created an account with someone else's email, chose a password, but could not
    # verify the email, we don't want that user to hijack the real email owner after they create
    # an account (with SSO).
    return nil if !user

    if user.confirmation_required? && !user.email_confirmed_at && user.password_digest
      user.destroy!
      return nil
    end

    return user.tap { |tapped_user| tapped_user.update!(password: nil) } unless AppConfiguration.instance.feature_activated? 'user_confirmation'

    user
  end
end
