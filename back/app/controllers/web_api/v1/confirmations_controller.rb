# frozen_string_literal: true

class WebApi::V1::ConfirmationsController < ApplicationController
  include UserCookies

  skip_before_action :authenticate_user, only: %i[confirm_code_email confirm_code_phone]
  before_action :reject_authenticated_caller, only: %i[confirm_code_email confirm_code_phone]
  skip_after_action :verify_authorized

  # Confirms a code for the `email` of an account that isn't signed in yet: email
  # account creation and passwordless login. The account is looked up from the
  # submitted `email`. An authenticated user re-confirming their own email uses
  # reconfirm_code_email instead.
  def confirm_code_email
    user = User.find_by_cimail(confirm_code_email_params[:email])

    result = user_confirmation_service.validate_and_confirm_email!(
      user,
      confirm_code_email_params[:code]
    )

    if result.success?
      SideFxUserService.new.after_update(user, user)
      IdeaExposureTransferService.new.transfer_from_request(user: user, request: request)

      render json: raw_json({ auth_token: short_lived_auth_token(user) })
    else
      render json: { errors: result.errors.details }, status: :unprocessable_entity
    end
  end

  # Re-confirmation of the signed-in user's own `email` after its
  # confirmed_email_expiry window has elapsed. EmailConfirmation#confirm!
  # refreshes email_confirmed_at, which is what resets that window. The caller
  # already holds a token, so none is returned.
  def reconfirm_code_email
    result = user_confirmation_service.validate_and_reconfirm_email!(
      current_user,
      confirm_code_params[:code]
    )

    if result.success?
      SideFxUserService.new.after_update(current_user, current_user)

      head :ok
    else
      render json: { errors: result.errors.details }, status: :unprocessable_entity
    end
  end

  # This endpoint is used when a logged in user wants to change their email
  def confirm_code_new_email
    result = user_confirmation_service.validate_and_confirm_new_email!(
      current_user,
      confirm_code_params[:code]
    )

    if result.success?
      SideFxUserService.new.after_update(current_user, current_user)

      reset_jwt_cookie
      head :ok
    else
      render json: { errors: result.errors.details }, status: :unprocessable_entity
    end
  end

  # The phone mirror of confirm_code_email: phone account creation and
  # passwordless login, with the account looked up from the submitted `phone`.
  def confirm_code_phone
    return head :unauthorized unless sms_login_enabled?

    user = User.find_by_phone_number(confirm_code_phone_params[:phone])

    result = user_confirmation_service.validate_and_confirm_phone!(
      user,
      confirm_code_phone_params[:code]
    )

    if result.success?
      SideFxUserService.new.after_update(user, user)
      IdeaExposureTransferService.new.transfer_from_request(user: user, request: request)
      record_sms_manual_campaign_consent(user, confirm_code_phone_params[:sms_manual_campaign_consent])

      render json: raw_json({ auth_token: short_lived_auth_token(user) })
    else
      render json: { errors: result.errors.details }, status: :unprocessable_entity
    end
  end

  # The phone mirror of reconfirm_code_email: re-confirmation of the signed-in
  # user's own `phone` after confirmed_phone_number_expiry has elapsed.
  def reconfirm_code_phone
    result = user_confirmation_service.validate_and_reconfirm_phone!(
      current_user,
      confirm_code_params[:code]
    )

    if result.success?
      SideFxUserService.new.after_update(current_user, current_user)

      head :ok
    else
      render json: { errors: result.errors.details }, status: :unprocessable_entity
    end
  end

  # This endpoint is used when a logged in user confirms a pending phone-number
  # change. On success, new_phone is promoted to phone. The phone
  # number isn't part of the auth token, so there's no JWT cookie to refresh.
  def confirm_code_new_phone
    result = user_confirmation_service.validate_and_confirm_new_phone!(
      current_user,
      confirm_code_new_phone_params[:code]
    )

    if result.success?
      SideFxUserService.new.after_update(current_user, current_user)
      record_sms_manual_campaign_consent(current_user, confirm_code_new_phone_params[:sms_manual_campaign_consent])
      head :ok
    else
      render json: { errors: result.errors.details }, status: :unprocessable_entity
    end
  end

  private

  # The confirm_code_* endpoints serve callers that aren't signed in yet. A
  # signed-in user confirming their own email or phone uses reconfirm_code_*.
  def reject_authenticated_caller
    head :unauthorized if current_user
  end

  def sms_login_enabled?
    AppConfiguration.instance.feature_activated?('sms_login')
  end

  # The sms feature carries the Twilio settings manual campaigns send through, so
  # sms_manual_campaigns only takes effect on top of it.
  def sms_manual_campaigns_enabled?
    app_configuration = AppConfiguration.instance
    app_configuration.feature_activated?('sms') && app_configuration.feature_activated?('sms_manual_campaigns')
  end

  def confirm_code_email_params
    params.require(:confirmation).permit(:email, :code)
  end

  def confirm_code_phone_params
    params.require(:confirmation).permit(:phone, :code, :sms_manual_campaign_consent)
  end

  def short_lived_auth_token(user)
    payload = user.to_token_payload
    payload[:exp] = AuthToken::AuthToken::TOKEN_SHORT_LIFETIME.from_now.to_i

    AuthToken::AuthToken.new payload: payload
  end

  def confirm_code_params
    params.require(:confirmation).permit(:code)
  end

  def confirm_code_new_phone_params
    params.require(:confirmation).permit(:code, :sms_manual_campaign_consent)
  end

  def record_sms_manual_campaign_consent(user, value)
    return unless sms_manual_campaigns_enabled?

    consented = parse_bool(value)
    return if consented.nil?

    EmailCampaigns::Sms::UseCaseConsentService.new.record!(
      user,
      EmailCampaigns::Sms::UseCase::MANUAL_CAMPAIGNS,
      consented: consented
    )
  end

  def user_confirmation_service
    @user_confirmation_service ||= UserConfirmationService.new
  end
end
