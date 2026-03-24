# frozen_string_literal: true

module EnforceUserSso
  extend ActiveSupport::Concern

  private

  def sso_enforced?
    sso_enforced_message_multiloc = AuthenticationService.sso_enforced_for_email(email_param)
    return false unless sso_enforced_message_multiloc

    render json: { errors: { email: [{ error: 'sso_enforced_for_domain', message_multiloc: sso_enforced_message_multiloc }] } }, status: :unprocessable_entity
  end

  def email_param
    params.dig(:user, :email)
  end
end
