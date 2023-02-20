# frozen_string_literal: true

class WebApi::V1::ResendCodesController < ApplicationController
  skip_after_action :verify_authorized

  def create
    result = SendConfirmationCode.call(user: current_user, new_email: resend_code_params[:new_email])

    if result.success?
      head :ok
    else
      render json: { errors: result.errors.details }, status: :unprocessable_entity
    end
  end

  private

  def resend_code_params
    params.permit(:new_email)
  end
end
