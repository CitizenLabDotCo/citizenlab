# frozen_string_literal: true

class WebApi::V1::ResendCodesController < ApplicationController
  skip_after_action :verify_authorized

  def create
    new_email = resend_code_params[:new_email]
    if new_email.present?
      RequestNewEmailConfirmationCodeJob.perform_now(current_user, new_email: new_email)
    else
      RequestEmailConfirmationCodeJob.perform_now(current_user)
    end
    head :ok
  rescue ActiveRecord::RecordInvalid
    render json: { errors: current_user.errors.details }, status: :unprocessable_entity
  end

  private

  def resend_code_params
    params.permit(:new_email)
  end
end
