# frozen_string_literal: true

class WebApi::V1::UserTokenController < AuthTokenController
  TOKEN_LIFETIME = 1.day

  private

  def auth_token
    payload = entity.to_token_payload

    unless auth_params[:remember_me] # default expiration is set in #to_token_payload and can also be used by 3rd party auth
      payload[:exp] = TOKEN_LIFETIME
    end

    AuthToken.new payload: payload
  end

  def extra_params
    [:remember_me]
  end
end
