# frozen_string_literal: true

class WebApi::V1::RequestCodesController < ApplicationController
  skip_before_action :authenticate_user
  skip_after_action :verify_authorized

  def request_code_unauthenticated
    email = request_code_unauthenticated_params[:email]

    if confirmation_codes_service.permit_request_code_unauthenticated(email)
      RequestConfirmationCodeJob.perform_now current_user, new_email: nil
    end

    head :ok
  end

  def request_code_authenticated
    # TODO
    head :ok
  end

  def request_code_email_change
    # TODO
    head :ok
  end

  private

  def request_code_unauthenticated_params
    params.require(:request_code).permit(:email)
  end

  def confirmation_codes_service
    @confirmation_codes_service ||= ConfirmationCodesService.new
  end
end
