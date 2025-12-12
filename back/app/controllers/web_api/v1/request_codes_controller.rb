# frozen_string_literal: true

class WebApi::V1::RequestCodesController < ApplicationController
  skip_before_action :authenticate_user, only: %i[request_code_unauthenticated]
  skip_after_action :verify_authorized

  # This endpoint allows unauthenticated users to request a confirmation code
  # This is used in the email account creation flow and when
  # logging in passwordless users
  def request_code_unauthenticated
    email = request_code_unauthenticated_params[:email]
    user = User.find_by_cimail(email)

    if confirmation_codes_service.permit_request_code_unauthenticated(user)
      user.update!(new_email: nil) # Clear any pending email change to avoid confusion
      RequestConfirmationCodeJob.perform_now user
    end

    head :ok
  end

  # This endpoint is used when a logged in user wants to change their email
  # It is also used for people who return from SSO and the SSO does not
  # provide a confirmed email.
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
