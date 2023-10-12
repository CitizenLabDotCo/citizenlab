# frozen_string_literal: true

class WebApi::V1::ResendCodesController < ApplicationController
  skip_after_action :verify_authorized

  def create
    RequestConfirmationCodeJob.perform_now(current_user, new_email: resend_code_params[:new_email])
    head :ok
  end

  private

  def resend_code_params
    params.permit(:new_email)
  end
end
