# frozen_string_literal: true

class WebApi::V1::UserTokenController < AuthToken::AuthTokenController
  include EnforceUserSso

  before_action :sso_enforced?, only: %i[create]

  def create
    ClaimTokenService.claim(entity, auth_params[:claim_tokens])
    IdeaExposureTransferService.new.transfer_from_request(user: entity, request: request)
    super
  end

  private

  def auth_token
    payload = entity.to_token_payload

    unless auth_params[:remember_me] # default expiration is set in #to_token_payload and can also be used by 3rd party auth
      payload[:exp] = AuthToken::AuthToken::TOKEN_SHORT_LIFETIME.from_now.to_i
    end

    AuthToken::AuthToken.new payload: payload
  end

  def extra_params
    [:remember_me, { claim_tokens: [] }]
  end

  def email_param
    params.dig(:auth, :email)
  end
end
