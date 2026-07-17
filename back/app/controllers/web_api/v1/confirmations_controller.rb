# frozen_string_literal: true

class WebApi::V1::ConfirmationsController < ApplicationController
  include UserCookies

  skip_before_action :authenticate_user, only: %i[confirm_code_unauthenticated]
  skip_after_action :verify_authorized

  # This endpoint allows unauthenticated users to confirm a code
  # This is used in the email account creation flow and when
  # logging in passwordless users
  def confirm_code_unauthenticated
    user = User.find_by_cimail(confirm_code_unauthenticated_params[:email])

    result = user_confirmation_service.validate_and_confirm_unauthenticated!(
      user,
      confirm_code_unauthenticated_params[:code]
    )

    if result.success?
      SideFxUserService.new.after_update(user, user)
      IdeaExposureTransferService.new.transfer_from_request(user: user, request: request)

      payload = user.to_token_payload
      payload[:exp] = AuthToken::AuthToken::TOKEN_SHORT_LIFETIME.from_now.to_i
      auth_token = AuthToken::AuthToken.new payload: payload

      render json: raw_json({ auth_token: })
    else
      render json: { errors: result.errors.details }, status: :unprocessable_entity
    end
  end

  # This endpoint is used when a logged in user wants to change their email
  def confirm_code_email_change
    result = user_confirmation_service.validate_and_confirm_email_change!(
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

  # This endpoint is used when a logged in user confirms a pending phone-number
  # change. On success, new_phone is promoted to phone. The phone
  # number isn't part of the auth token, so there's no JWT cookie to refresh.
  def confirm_code_phone_change
    result = user_confirmation_service.validate_and_confirm_phone_change!(
      current_user,
      confirm_code_phone_change_params[:code]
    )

    if result.success?
      SideFxUserService.new.after_update(current_user, current_user)
      record_sms_manual_campaign_consent
      head :ok
    else
      render json: { errors: result.errors.details }, status: :unprocessable_entity
    end
  end

  private

  def confirm_code_unauthenticated_params
    params.require(:confirmation).permit(:email, :code)
  end

  def confirm_code_params
    params.require(:confirmation).permit(:code)
  end

  def confirm_code_phone_change_params
    params.require(:confirmation).permit(:code, :sms_manual_campaign_consent)
  end

  # Recorded once the phone is confirmed, so an abandoned confirmation never
  # persists consent for an unverified number.
  def record_sms_manual_campaign_consent
    manual_campaign_consent = confirm_code_phone_change_params[:sms_manual_campaign_consent]
    return if manual_campaign_consent.nil?

    EmailCampaigns::Consent
      .find_or_initialize_by(user_id: current_user.id, campaign_type: 'EmailCampaigns::Campaigns::SmsManual')
      .update!(consented: manual_campaign_consent)
  end

  def user_confirmation_service
    @user_confirmation_service ||= UserConfirmationService.new
  end
end
