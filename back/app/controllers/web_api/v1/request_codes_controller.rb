# frozen_string_literal: true

class WebApi::V1::RequestCodesController < ApplicationController
  # Authentication is optional (not skipped-and-forbidden) for request_code_email:
  # it serves both unauthenticated callers (email signup / passwordless login) and
  # authenticated callers re-confirming their own email once confirmed_email_expiry
  # has elapsed. The RequestCodePolicy distinguishes the two.
  skip_before_action :authenticate_user, only: %i[request_code_email]

  # Sends a confirmation code for the user's `email`, to be confirmed in place
  # (EmailConfirmation). Two callers:
  #   - unauthenticated: email account creation flow and passwordless login. The
  #     email is looked up from the submitted `email` param.
  #   - authenticated: re-confirmation of an already-confirmed email whose
  #     confirmed_email_expiry window has elapsed. Here the caller is the account
  #     owner, so `email` may be omitted and we use current_user.
  #
  # `only_if_first_time` makes the send idempotent (used for the auto-send when the
  # flow lands the user on the confirmation step): the code is only (re)sent when
  # none is currently outstanding — i.e. the first send of this confirmation cycle
  # — so reopening the modal or recomputing requirements neither spams the user nor
  # invalidates a code they already hold.
  def request_code_email
    email = request_code_email_params[:email]

    # Resolve the account the code will be sent to. Only three situations are
    # legitimate, and RequestCodePolicy enforces them:
    #   1. email param + no authenticated user -> look the account up by email.
    #   2. no email param + authenticated user -> use current_user.
    #   3. email param + authenticated user    -> the email must resolve to the
    #      authenticated user's own account; requesting a code for someone else's
    #      email is rejected (401).
    user = email.present? ? User.find_by_cimail(email) : current_user
    authorize user, policy_class: RequestCodePolicy

    unless only_if_first_time? && user.email_confirmation.code_outstanding?
      RequestEmailConfirmationCodeJob.perform_now user
    end

    head :ok
  end

  # This endpoint is used when a logged in user wants to change their email
  # It is also used for people who return from SSO and the SSO does not
  # provide a confirmed email.
  def request_code_new_email
    authorize current_user, policy_class: RequestCodePolicy
    new_email = request_code_new_email_params[:new_email]

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
  # new_phone and an SMS confirmation code is sent to it.
  #
  # For re-confirmation of an existing phone (confirmed_phone_number_expiry has
  # elapsed) the number is the user's own, so `new_phone` may be omitted and we
  # fall back to current_user.phone. `only_if_first_time` makes the send idempotent,
  # as for request_code_email.
  def request_code_new_phone
    authorize current_user, policy_class: RequestCodePolicy

    new_phone = request_code_new_phone_params[:new_phone].presence
    new_phone ||= current_user.phone if only_if_first_time?
    if new_phone.blank?
      render json: { errors: { new_phone: [{ error: 'blank' }] } }, status: :unprocessable_entity
      return
    end

    parsed = Phonelib.parse(new_phone)
    if parsed.invalid?
      render json: { errors: { new_phone: [{ error: 'invalid' }] } }, status: :unprocessable_entity
      return
    end
    normalized = parsed.e164

    if User.where.not(id: current_user.id).exists?(phone: normalized)
      render json: { errors: { new_phone: [{ error: 'taken' }] } }, status: :unprocessable_entity
      return
    end

    unless only_if_first_time? && current_user.new_phone_confirmation.code_outstanding?
      RequestNewPhoneConfirmationCodeJob.perform_now(current_user, new_phone: normalized)
    end

    head :ok
  end

  private

  # Whether the caller asked for the idempotent "send only if no code is
  # outstanding" behaviour (the first send of the confirmation cycle). Present on
  # both request_code_email and request_code_new_phone.
  def only_if_first_time?
    ActiveModel::Type::Boolean.new.cast(params.fetch(:request_code, {})[:only_if_first_time])
  end

  def request_code_email_params
    params.require(:request_code).permit(:email, :only_if_first_time)
  end

  def request_code_new_email_params
    params.fetch(:request_code, {}).permit(:new_email)
  end

  def request_code_new_phone_params
    params.fetch(:request_code, {}).permit(:new_phone, :only_if_first_time)
  end
end
