# frozen_string_literal: true

class WebApi::V1::UserTokenController < AuthToken::AuthTokenController
  TOKEN_LIFETIME = 1.day
  before_action :authenticate_user_token_unconfirmed, only: [:user_token_unconfirmed]
  skip_before_action :authenticate, only: [:user_token_unconfirmed]

  # Passwordless login for platforms without email confirmation.
  #
  # This endpoint is part of the signup flow when `user_confirmation` is disabled:
  # 1. User creates account via POST /users with email only
  # 2. User calls this endpoint to get a JWT (only works if no password is set)
  # 3. User updates their profile (password, name, etc.) using the JWT
  def user_token_unconfirmed
    user = User.find_by_cimail(user_token_unconfirmed_params[:email])

    raise ActiveRecord::RecordNotFound if user.blank?

    if user.password_digest.present?
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

  def authenticate_user_token_unconfirmed
    return unless AppConfiguration.instance.feature_activated?('user_confirmation')

    raise ActiveRecord::RecordNotFound
  end
end
