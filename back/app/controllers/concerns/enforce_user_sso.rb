# frozen_string_literal: true

module EnforceUserSso
  extend ActiveSupport::Concern

  private

  def sso_enforced?
    method = AuthenticationService.new.sso_method_enforced_for_email(email_param)
    return false unless method

    # The method name lets the front-end show that method's own message and button.
    error = { error: 'sso_enforced_for_domain', payload: { id_method: method.name } }
    render json: { errors: { email: [error] } }, status: :unprocessable_entity
  end

  def email_param
    params.dig(:user, :email)
  end
end
