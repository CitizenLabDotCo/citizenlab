# frozen_string_literal: true

class WebApi::V1::UserTokenController < AuthToken::AuthTokenController
  include UserAuthCookie

  def create
    expires = auth_params[:remember_me] ? LONG_TOKEN_LIFETIME.from_now : SHORT_TOKEN_LIFETIME.from_now
    set_auth_cookie(auth_token: auth_token, expires: expires)
    head :created
  end

  private

  def auth_token
    payload = entity.to_token_payload

    unless auth_params[:remember_me] # default expiration is set in #to_token_payload and can also be used by 3rd party auth
      payload[:exp] = SHORT_TOKEN_LIFETIME.from_now.to_i
    end

    AuthToken::AuthToken.new payload: payload
  end

  def extra_params
    [:remember_me]
  end
end
