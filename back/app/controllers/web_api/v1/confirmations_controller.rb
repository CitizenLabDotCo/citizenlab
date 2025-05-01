# frozen_string_literal: true

class WebApi::V1::ConfirmationsController < ApplicationController
  skip_after_action :verify_authorized

  def create
    result = ConfirmUser.call(user: current_user, code: confirmation_params[:code])

    if result.success?
      SideFxUserService.new.after_update(current_user, current_user)

      head :ok
    else
      render json: { errors: result.errors.details }, status: :unprocessable_entity
    end
  end

  private

  def confirmation_params
    params.require(:confirmation).permit(:code)
  end
end
