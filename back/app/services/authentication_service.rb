# frozen_string_literal: true

class AuthenticationService
  def initialize
    @id_method_service = IdMethodService.new
  end

  class << self
    # Returns true if SSO is enforced for this email's domain, false otherwise.
    def sso_enforced_for_email?(email)
      return false if email.blank?

      domain = email.split('@').last&.strip&.downcase
      return false if domain.blank?

      configured_authentication_methods = @id_method_service
        .configured_methods(AppConfiguration.instance)
        .select(:authentication?)

      configured_authentication_methods.any? { 
        |_, method| method.enforced_email_domains.include?(domain) 
      }
    end
  end

  def logout_url(provider, user)
    auth_method = @id_method_service.method_by_name(provider)
    return unless supports_logout?(provider)

    auth_method.logout_url(user)
  end

  def supports_logout?(provider)
    @id_method_service.method_by_name(provider).respond_to? :logout_url
  end

  def prevent_user_account_hijacking(user)
    # When a user created an account with someone else's email, chose a password, but could not
    # verify the email, we don't want that user to hijack the real email owner after they create
    # an account (with SSO).
    # (this should not be possible anymore anyway, since you now always confirm your email
    # before setting a password. But just in case)
    return nil if !user

    if user.confirmation_required? && !user.email_confirmed_at && user.password_digest
      DeleteUserJob.perform_now(user)
      return nil
    end

    user
  end
end
