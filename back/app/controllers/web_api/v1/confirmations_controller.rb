# frozen_string_literal: true

class WebApi::V1::ConfirmationsController < ApplicationController
  skip_before_action :authenticate_user, only: %i[confirm_code_unauthenticated]
  skip_after_action :verify_authorized

  # This endpoint allows unauthenticated users to confirm a code
  # This is used in the email account creation flow and when
  # logging in passwordless users
  def confirm_code_unauthenticated
    user = User.find_by(email: confirm_code_unauthenticated_params[:email])

    result = user_confirmation_service.validate_and_confirm_unauthenticated!(
      user,
      confirm_code_unauthenticated_params[:code]
    )

    if result.success?
      SideFxUserService.new.after_update(user, user)

      payload = user.to_token_payload
      auth_token = AuthToken::AuthToken.new payload: payload

      render json: raw_json({ auth_token: })
    else
      render json: { errors: result.errors.details }, status: :unprocessable_entity
    end
  end

  # This endpoint is for users who are logged in, but don't yet have a confirmed email
  # this can happen if they signed up via SSO without an email, or if they signed up
  # with an email but never confirmed it (now not possible anymore, but previously it was)
  def confirm_code_authenticated
    result = user_confirmation_service.validate_and_confirm_authenticated!(
      current_user,
      confirm_code_params[:code]
    )

    if result.success?
      SideFxUserService.new.after_update(current_user, current_user)

      payload = current_user.to_token_payload
      auth_token = AuthToken::AuthToken.new payload: payload

      render json: raw_json({ auth_token: })
    else
      render json: { errors: result.errors.details }, status: :unprocessable_entity
    end
  end

  # This endpoint is used when a logged in user wants to change their email
  def confirm_code_email_change
    result = user_confirmation_service.validate_and_confirm_email_change!(
      current_user,
      confirm_code_params[:code]
    )

    if result.success?
      SideFxUserService.new.after_update(current_user, current_user)

      head :ok
    else
      render json: { errors: result.errors.details }, status: :unprocessable_entity
    end
  end

  private

  def confirm_code_unauthenticated_params
    params.require(:confirmation).permit(:email, :code)
  end

  def confirm_code_params
    params.require(:confirmation).permit(:code)
  end

  def user_confirmation_service
    @user_confirmation_service ||= UserConfirmationService.new
  end
end
