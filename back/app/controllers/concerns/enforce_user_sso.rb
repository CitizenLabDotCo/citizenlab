# frozen_string_literal: true

module EnforceUserSso
  extend ActiveSupport::Concern

  private

  def sso_enforced?
    sso_enforced_message = AuthenticationService.sso_enforced_for_email(email_param)
    return false unless sso_enforced_message

    render json: { errors: { email: [{ error: 'sso_enforced_for_domain', message: sso_enforced_message }] } }, status: :unprocessable_entity
  end

  def email_param
    params.dig(:user, :email)
  end
end
