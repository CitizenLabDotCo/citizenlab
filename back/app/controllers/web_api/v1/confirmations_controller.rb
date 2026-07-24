# frozen_string_literal: true

class WebApi::V1::ConfirmationsController < ApplicationController
  include UserCookies

  # Authentication is optional (not skipped-and-forbidden) for confirm_code_email:
  # it serves both unauthenticated callers (email signup / passwordless login) and
  # authenticated callers re-confirming their own email after confirmed_email_expiry.
  skip_before_action :authenticate_user, only: %i[confirm_code_email]
  skip_after_action :verify_authorized

  # Confirms a code for the user's `email` (in-place EmailConfirmation). Two callers:
  #   - unauthenticated: email account creation flow and passwordless login.
  #   - authenticated: re-confirmation of an expired confirmed_email. On success
  #     EmailConfirmation#confirm! refreshes email_confirmed_at, which is exactly
  #     what resets the expiry window.
  def confirm_code_email
    user = User.find_by_cimail(confirm_code_email_params[:email])

    result = user_confirmation_service.validate_and_confirm_unauthenticated!(
      user,
      confirm_code_email_params[:code]
    )

    if result.success?
      SideFxUserService.new.after_update(user, user)
      IdeaExposureTransferService.new.transfer_from_request(user: user, request: request)

      payload = user.to_token_payload
      payload[:exp] = AuthToken::AuthToken::TOKEN_SHORT_LIFETIME.from_now.to_i
      auth_token = AuthToken::AuthToken.new payload: payload

      render json: raw_json({ auth_token: })
    else
      render json: { errors: result.errors.details }, status: :unprocessable_entity
    end
  end

  # This endpoint is used when a logged in user wants to change their email
  def confirm_code_new_email
    result = user_confirmation_service.validate_and_confirm_email_change!(
      current_user,
      confirm_code_params[:code]
    )

    if result.success?
      SideFxUserService.new.after_update(current_user, current_user)

      reset_jwt_cookie
      head :ok
    else
      render json: { errors: result.errors.details }, status: :unprocessable_entity
    end
  end

  # This endpoint is used when a logged in user confirms a pending phone-number
  # change. On success, new_phone is promoted to phone. The phone
  # number isn't part of the auth token, so there's no JWT cookie to refresh.
  def confirm_code_new_phone
    result = user_confirmation_service.validate_and_confirm_phone_change!(
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

  def confirm_code_email_params
    params.require(:confirmation).permit(:email, :code)
  end

  def confirm_code_params
    params.require(:confirmation).permit(:code)
  end

  def user_confirmation_service
    @user_confirmation_service ||= UserConfirmationService.new
  end
end
