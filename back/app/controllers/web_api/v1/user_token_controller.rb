# frozen_string_literal: true

class WebApi::V1::UserTokenController # < Knock::AuthTokenController # TODO
  private

  def auth_token
    payload = entity.to_token_payload

    unless auth_params[:remember_me] # default expiration is set in #to_token_payload and can also be used by 3rd party auth
      payload[:exp] = 1.day.from_now.to_i
    end

    AuthToken.new payload: payload
  end

  def auth_params
    params.require(:auth).permit :email, :password, :remember_me
  end
end
