# frozen_string_literal: true

class WebApi::V1::ConfirmationsController < ApplicationController
  skip_before_action :authenticate_user
  skip_after_action :verify_authorized

  def create
    user = User.find_by(email: confirmation_params[:email])
    result = ConfirmUser.call(user:, code: confirmation_params[:code])

    if result.success?
      SideFxUserService.new.after_update(user, user)

      payload = user.to_token_payload
      auth_token = AuthToken::AuthToken.new payload: payload

      render json: raw_json({ auth_token: })
    else
      render json: { errors: result.errors.details }, status: :unprocessable_entity
    end
  end

  private

  def confirmation_params
    params.require(:confirmation).permit(:email, :code)
  end
end
