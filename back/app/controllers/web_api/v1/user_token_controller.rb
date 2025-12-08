# frozen_string_literal: true

class WebApi::V1::UserTokenController < AuthToken::AuthTokenController
  private

  def auth_token
    payload = entity.to_token_payload

    # TODO: This can probably be removed, since the FE no longer needs it,
    # but leaving it for now to avoid any potential issues with other services.
    payload[:exp] = @token_lifetime.from_now.to_i

    AuthToken::AuthToken.new payload: payload
  end

  def extra_params
    [:remember_me]
  end
end
