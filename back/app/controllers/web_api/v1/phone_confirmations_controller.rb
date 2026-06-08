# frozen_string_literal: true

class WebApi::V1::PhoneConfirmationsController < ApplicationController
  skip_after_action :verify_authorized

  # Sets (or updates) the current user's phone number and sends a verification
  # code by SMS. Re-requesting resets the code.
  def request_code
    phone_number = request_code_params[:phone_number]

    if phone_number.present?
      current_user.assign_attributes(phone_number: phone_number, phone_number_verified_at: nil)
      unless current_user.save
        render json: { errors: current_user.errors.details }, status: :unprocessable_entity
        return
      end
    elsif current_user.phone_number.blank?
      render json: { errors: { phone_number: [{ error: 'blank' }] } }, status: :unprocessable_entity
      return
    end

    RequestPhoneConfirmationCodeJob.perform_now(current_user)
    head :ok
  end

  # Verifies a previously requested code and marks the phone number as verified.
  def confirm_code
    result = user_confirmation_service.validate_and_confirm_phone!(
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

  private

  def request_code_params
    params.fetch(:phone_confirmation, {}).permit(:phone_number)
  end

  def confirm_code_params
    params.require(:phone_confirmation).permit(:code)
  end

  def user_confirmation_service
    @user_confirmation_service ||= UserConfirmationService.new
  end
end
