# frozen_string_literal: true

module EnforceUserSso
  extend ActiveSupport::Concern

  private

  def sso_enforced?
    return false unless AuthenticationService.sso_enforced_for_email?(email_param)

    render json: { errors: { email: [{ error: 'sso_enforced_for_domain' }] } }, status: :unprocessable_entity
  end

  def email_param
    params.dig(:user, :email)
  end
end
