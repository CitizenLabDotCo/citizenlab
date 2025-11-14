# frozen_string_literal: true

class WebApi::V1::RequestCodesController < ApplicationController
  skip_before_action :authenticate_user, only: %i[request_code_unauthenticated]
  skip_after_action :verify_authorized

  # This endpoint allows unauthenticated users to request a confirmation code
  # This is used in the email account creation flow and when
  # logging in passwordless users
  def request_code_unauthenticated
    email = request_code_unauthenticated_params[:email]
    user = User.find_by(email: email)

    if confirmation_codes_service.permit_request_code_unauthenticated(user)
      user.update!(new_email: nil) # Clear any pending email change to avoid confusion
      RequestConfirmationCodeJob.perform_now user
    end

    head :ok
  end

  # This endpoint is for users who are logged in, but don't yet have a confirmed email
  # this can happen if they signed up via SSO without an email, or if they signed up
  # with an email but never confirmed it (now not possible anymore, but previously it was)
  def request_code_authenticated
    if confirmation_codes_service.permit_request_code_authenticated(current_user)
      current_user.update!(new_email: nil) # Clear any pending email change to avoid confusion
      RequestConfirmationCodeJob.perform_now current_user
    end

    head :ok
  end

  # This endpoint is used when a logged in user wants to change their email
  def request_code_email_change
    new_email = request_code_email_change_params[:new_email]

    if confirmation_codes_service.permit_request_code_email_change(
      current_user,
      new_email
    )
      RequestConfirmationCodeJob.perform_now(
        current_user, new_email:
      )
    end

    head :ok
  end

  private

  def request_code_unauthenticated_params
    params.require(:request_code).permit(:email)
  end

  def request_code_email_change_params
    params.require(:request_code).permit(:new_email)
  end

  def confirmation_codes_service
    @confirmation_codes_service ||= ConfirmationCodesService.new
  end
end
