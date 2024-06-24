# frozen_string_literal: true

class WebApi::V1::ConfirmationsController < ApplicationController
  include ActionController::Cookies
  skip_after_action :verify_authorized

  def create
    result = ConfirmUser.call(user: current_user, code: confirmation_params[:code])

    if result.success?
      reset_auth_cookie
      head :ok
    else
      render json: { errors: result.errors.details }, status: :unprocessable_entity
    end
  end

  private

  def reset_auth_cookie
    # TODO: JS Need to get the expiry from the current token
    payload = current_user.to_token_payload
    payload[:exp] = 1.day.from_now.to_i
    cookies[:cl2_jwt] = {
      value: AuthToken::AuthToken.new(payload: payload).token,
      expires: 1.day.from_now
    }
  end

  def confirmation_params
    params.require(:confirmation).permit(:code)
  end
end
