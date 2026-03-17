# frozen_string_literal: true

class WebApi::V1::UserTokenController < AuthToken::AuthTokenController
  TOKEN_LIFETIME = 1.day
  before_action :authenticate_user_token_unconfirmed, only: [:user_token_unconfirmed]
  skip_before_action :authenticate, only: %i[user_token_unconfirmed refresh]
  before_action :authenticate_from_jwt, only: [:refresh]

  # This endpoint is only used when user_confirmation is disabled.
  def user_token_unconfirmed
    user = User.find_by_cimail(user_token_unconfirmed_params[:email])

    raise ActiveRecord::RecordNotFound if user.blank?

    if user.password_digest.present? || user.sso?
      render(
        json: { errors: { base: [{ error: 'cannot_have_password' }] } },
        status: :unprocessable_entity
      )
    else
      ClaimTokenService.claim(user, nil)
      IdeaExposureTransferService.new.transfer_from_request(user: user, request: request)
      render json: auth_token, status: :created
    end
  end

  def create
    ClaimTokenService.claim(entity, auth_params[:claim_tokens])
    IdeaExposureTransferService.new.transfer_from_request(user: entity, request: request)
    super
  end

  def refresh
    payload = @current_user.to_token_payload
    payload[:exp] = TOKEN_LIFETIME.from_now.to_i
    render json: AuthToken::AuthToken.new(payload: payload), status: :created
  end

  private

  def auth_token
    payload = entity.to_token_payload

    unless auth_params[:remember_me] # default expiration is set in #to_token_payload and can also be used by 3rd party auth
      payload[:exp] = TOKEN_LIFETIME.from_now.to_i
    end

    AuthToken::AuthToken.new payload: payload
  end

  def extra_params
    [:remember_me, { claim_tokens: [] }]
  end

  def user_token_unconfirmed_params
    params.require(:auth).permit id_param
  end

  def authenticate_from_jwt
    token = request.headers['Authorization']&.split(' ')&.last
    raise ActiveRecord::RecordNotFound if token.blank?

    decoded = AuthToken::AuthToken.new(token: token)
    @current_user = User.find(decoded.payload['sub'])
  rescue JWT::ExpiredSignature, JWT::DecodeError, ActiveRecord::RecordNotFound
    head :unauthorized
  end

  def authenticate_user_token_unconfirmed
    return unless AppConfiguration.instance.feature_activated?('user_confirmation')

    raise ActiveRecord::RecordNotFound
  end
end
