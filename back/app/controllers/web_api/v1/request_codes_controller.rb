# frozen_string_literal: true

class WebApi::V1::RequestCodesController < ApplicationController
  skip_before_action :authenticate_user, only: %i[request_code_unauthenticated]

  # This endpoint allows unauthenticated users to request a confirmation code
  # This is used in the email account creation flow and when
  # logging in passwordless users
  def request_code_unauthenticated
    email = request_code_unauthenticated_params[:email]
    user = User.find_by_cimail(email)
    authorize user, policy_class: RequestCodePolicy

    RequestEmailConfirmationCodeJob.perform_now user

    head :ok
  end

  # This endpoint is used when a logged in user wants to change their email
  # It is also used for people who return from SSO and the SSO does not
  # provide a confirmed email.
  def request_code_email_change
    authorize current_user, policy_class: RequestCodePolicy
    new_email = request_code_email_change_params[:new_email]

    if current_user.new_email.blank? && new_email.blank?
      render json: { errors: { new_email: [{ error: 'cannot be blank' }] } }, status: :unprocessable_entity
      return
    end

    user_associated_with_new_email = new_email.present? ? User.find_by_cimail(new_email) : nil

    if user_associated_with_new_email && user_associated_with_new_email != current_user
      render json: { errors: { new_email: [{ error: 'is already taken' }] } }, status: :unprocessable_entity
      return
    end

    new_email_with_fallback = new_email.presence || current_user.new_email

    RequestNewEmailConfirmationCodeJob.perform_now(
      current_user,
      new_email: new_email_with_fallback
    )

    head :ok
  end

  # This endpoint is used when a logged in user wants to add or change their
  # (verified) phone number. The submitted number is held as a pending
  # new_phone_number and an SMS confirmation code is sent to it.
  def request_code_phone_change
    authorize current_user, policy_class: RequestCodePolicy

    phone_number = request_code_phone_change_params[:phone_number]
    if phone_number.blank?
      render json: { errors: { phone_number: [{ error: 'cannot be blank' }] } }, status: :unprocessable_entity
      return
    end

    normalized = Phonelib.parse(phone_number).e164.presence
    unless normalized && Phonelib.valid?(normalized)
      render json: { errors: { phone_number: [{ error: 'is invalid' }] } }, status: :unprocessable_entity
      return
    end

    if User.where.not(id: current_user.id).exists?(phone_number: normalized)
      render json: { errors: { phone_number: [{ error: 'is already taken' }] } }, status: :unprocessable_entity
      return
    end

    RequestNewPhoneConfirmationCodeJob.perform_now(current_user, new_phone_number: normalized)

    head :ok
  end

  private

  def request_code_unauthenticated_params
    params.require(:request_code).permit(:email)
  end

  def request_code_email_change_params
    params.fetch(:request_code, {}).permit(:new_email)
  end

  def request_code_phone_change_params
    params.fetch(:request_code, {}).permit(:phone_number)
  end
end
