# frozen_string_literal: true

class WebApi::V1::ConfirmationsController < ApplicationController
  skip_before_action :authenticate_user, only: %i[confirm_code_unauthenticated]
  skip_after_action :verify_authorized

  # This endpoint allows unauthenticated users to confirm a code
  # This is used in the email account creation flow and when 
  # logging in passwordless users
  def confirm_code_unauthenticated
    user = User.find_by(email: confirmation_params[:email])
    result = ConfirmUser.call(user:, code: confirmation_params[:code])

    if result.success?
      SideFxUserService.new.after_update(user, user)

      payload = user.to_token_payload
      auth_token = AuthToken::AuthToken.new payload: payload

      render json: raw_json({ auth_token: })
    else
      render json: { errors: result.errors.details }, status: :unprocessable_entity
    end
  end

  # This endpoint is used for an edge case:
  # users that have a password and are logged in, but are not yet confirmed,
  # while the user_confirmation feature is enabled.
  # This should not be possible anymore, but there may still be some
  # legacy accounts like this. This way, they can confirm their email
  def confirm_code_authenticated
    # TODO
  end

  # This endpoint is used when a logged in user wants to change their email
  # (or set their email for the first time if they came from SSO without email)
  def confirm_code_email_change
    # TODO
  end

  private

  def confirm_code_unauthenticated_params
    params.require(:confirmation).permit(:email, :code)
  end

  def confirm_code_params
    params.require(:confirmation).permit(:code)
  end

  # skip_before_action :authenticate_user
  # skip_after_action :verify_authorized

  # def create
  #   user = User.find_by(email: confirmation_params[:email])
  #   result = ConfirmUser.call(user:, code: confirmation_params[:code])

  #   if result.success?
  #     SideFxUserService.new.after_update(user, user)

  #     payload = user.to_token_payload
  #     auth_token = AuthToken::AuthToken.new payload: payload

  #     render json: raw_json({ auth_token: })
  #   else
  #     render json: { errors: result.errors.details }, status: :unprocessable_entity
  #   end
  # end

  # private

  # def confirmation_params
  #   params.require(:confirmation).permit(:email, :code)
  # end
end
