# frozen_string_literal: true

class WebApi::V1::ConfirmationsController < ApplicationController
  include UserCookies

  # Authentication is optional (not skipped-and-forbidden) for confirm_code_email
  # and confirm_code_phone: they serve both unauthenticated callers (signup /
  # passwordless login) and authenticated callers re-confirming their own email or
  # phone number after the corresponding expiry.
  skip_before_action :authenticate_user, only: %i[confirm_code_email confirm_code_phone]
  skip_after_action :verify_authorized

  # Confirms a code for the user's `email` (in-place EmailConfirmation). Two callers:
  #   - unauthenticated: email account creation flow and passwordless login.
  #   - authenticated: re-confirmation of an expired confirmed_email. On success
  #     EmailConfirmation#confirm! refreshes email_confirmed_at, which is exactly
  #     what resets the expiry window.
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

  # Confirms a code for the user's `phone` (in-place PhoneConfirmation). The phone
  # mirror of confirm_code_email, with the same two callers:
  #   - unauthenticated: phone account creation flow and passwordless login. The
  #     account is looked up from the submitted `phone` param.
  #   - authenticated: re-confirmation of an existing phone number after
  #     confirmed_phone_number_expiry. On success PhoneConfirmation#confirm!
  #     refreshes phone_confirmed_at, which is exactly what resets the expiry
  #     window.
  # A token is always returned, but only the unauthenticated caller needs it -
  # an authenticated one keeps the (possibly longer-lived) token it already has.
  def confirm_code_phone
    return head :unauthorized unless current_user || sms_login_enabled?

    phone = confirm_code_phone_params[:phone]
    user = phone.present? ? User.find_by_phone_number(phone) : current_user

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

  def sms_login_enabled?
    AppConfiguration.instance.feature_activated?('sms_login')
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
    manual_campaign_consent = parse_bool(value)
    return if manual_campaign_consent.nil?

    consent = EmailCampaigns::ConsentService.new.record!(
      user,
      EmailCampaigns::Campaigns::SmsManual,
      consented: manual_campaign_consent
    )
    EmailCampaigns::SideFxConsentService.new.after_update(consent, user)
  end

  def user_confirmation_service
    @user_confirmation_service ||= UserConfirmationService.new
  end
end
