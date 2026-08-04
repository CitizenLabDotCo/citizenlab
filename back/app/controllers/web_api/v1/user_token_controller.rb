# frozen_string_literal: true

# Exchanges credentials for a JWT. Logging in with an email address and logging in
# with a phone number are two separate endpoints: each looks the user up by its own
# identifier and only lets them in when they confirmed that same identifier.
class WebApi::V1::UserTokenController < ActionController::API
  include EnforceUserSso

  before_action :sso_enforced?, only: %i[create]

  # Email address + password.
  def create
    user = User.not_invited.find_by_cimail(auth_params[:email])

    # `confirmation_required` is only ever cleared together with `email_confirmed_at`,
    # so it tells us whether this email address was confirmed.
    return head :not_found unless user && !user.confirmation_required? && password_correct?(user)

    handle_successful_authentication_sidefx(user)
    render json: auth_token(user), status: :created
  end

  # Phone number + password. Users who signed up with their phone number have no
  # password until they set one; they log in through confirm_code_phone instead.
  def create_phone
    return head :not_found unless AppConfiguration.instance.feature_activated?('sms')

    user = User.not_invited.find_by_phone_number(auth_params[:phone])

    return head :not_found unless user&.phone_confirmed_at && password_correct?(user)

    handle_successful_authentication_sidefx(user)
    render json: auth_token(user), status: :created
  end

  private

  def handle_successful_authentication_sidefx(user)
    ClaimTokenService.claim(user, auth_params[:claim_tokens])
    IdeaExposureTransferService.new.transfer_from_request(user: user, request: request)
  end

  # A blank password is never a valid credential. User#authenticate rejects it as
  # well, but we refuse it here too so that a user without a password can never be
  # handed a token without presenting anything at all.
  def password_correct?(user)
    password = auth_params[:password]

    password.present? && user.authenticate(password).present?
  end

  def auth_token(user)
    payload = user.to_token_payload

    unless auth_params[:remember_me] # default expiration is set in #to_token_payload and can also be used by 3rd party auth
      payload[:exp] = AuthToken::AuthToken::TOKEN_SHORT_LIFETIME.from_now.to_i
    end

    AuthToken::AuthToken.new payload: payload
  end

  def auth_params
    @auth_params ||= params.require(:auth).permit(:email, :phone, :password, :remember_me, claim_tokens: [])
  end

  def email_param
    params.dig(:auth, :email)
  end
end
