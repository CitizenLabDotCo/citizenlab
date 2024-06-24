# frozen_string_literal: true

class WebApi::V1::ConfirmationsController < ApplicationController
  skip_after_action :verify_authorized

  def create
    result = ConfirmUser.call(user: current_user, code: confirmation_params[:code])

    if result.success?
      # Return an updated token in case others have attempted to login elsewhere with the same email
      payload = current_user.to_token_payload

      # TODO: JS Need to get the expiry from the current token
      payload[:exp] = 1.day.from_now.to_i

      # TODO: JS should we send this in the main JWT too?
      render json: {
        data: {
          type: 'jwt',
          attributes: {
            token: AuthToken::AuthToken.new(payload: payload).token
          }
        }
      }, status: :ok
    else
      render json: { errors: result.errors.details }, status: :unprocessable_entity
    end
  end

  private

  def confirmation_params
    params.require(:confirmation).permit(:code)
  end
end
