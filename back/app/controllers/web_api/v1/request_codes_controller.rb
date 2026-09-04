# frozen_string_literal: true

class WebApi::V1::RequestCodesController < ApplicationController
  skip_before_action :authenticate_user, only: %i[request_code_email request_code_phone]

  # Sends a confirmation code for the `email` of an account that isn't signed in
  # yet: email account creation and passwordless login. The account is looked up
  # from the submitted `email`, and RequestCodePolicy rejects authenticated
  # callers - a signed-in user re-confirming their own email uses
  # request_reconfirm_code_email instead.
  def request_code_email
    user = User.find_by_cimail(request_code_email_params[:email])
    authorize user, policy_class: RequestCodePolicy

    RequestEmailConfirmationCodeJob.perform_now user

    head :ok
  end

  # Sends a re-confirmation code for the signed-in user's own `email`, after its
  # confirmed_email_expiry window has elapsed.
  def request_reconfirm_code_email
    authorize current_user, policy_class: RequestCodePolicy

    unless only_if_first_time? && current_user.email_confirmation&.code_outstanding?
      RequestEmailConfirmationCodeJob.perform_now current_user
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
      # An email-less SSO user typing an address that already has an account is
      # almost always the same person arriving a second way, so offer to merge the
      # two rather than dead-ending them. The source-side guards are also the scope
      # fence: this endpoint is shared with the ordinary profile email change, and
      # they keep the merge from ever being offered there.
      unless account_merge_offerable?(current_user)
        render json: { errors: { new_email: [{ error: 'is already taken' }] } }, status: :unprocessable_entity
        return
      end

      # Throttled against its own budget, not the new-email one: being locked out
      # of merging must still leave "change your email" usable.
      authorize current_user, :request_merge_account_code?, policy_class: RequestCodePolicy

      # Whether the *target* may be merged into is deliberately not checked here.
      # Refusing up front would let anyone probe which addresses belong to admins;
      # the code goes to the target's own inbox, so nobody who cannot read it gets
      # any further. AccountMergeEligibilityService runs at confirm time instead.
      RequestMergeAccountConfirmationCodeJob.perform_now(current_user, target_email: new_email)

      render json: raw_json({ confirmation_type: 'merge_account' })
      return
    end

    new_email_with_fallback = new_email.presence || current_user.new_email

    RequestNewEmailConfirmationCodeJob.perform_now(
      current_user,
      new_email: new_email_with_fallback
    )

    render json: raw_json({ confirmation_type: 'new_email' })
  end

  # The phone mirror of request_code_email: phone signup / passwordless login,
  # with the account looked up from the submitted `phone`.
  def request_code_phone
    user = User.find_by_phone_number(request_code_phone_params[:phone])
    authorize user, policy_class: RequestCodePolicy

    confirmation = user.phone_confirmation
    return render_resend_too_soon(confirmation) if resend_too_soon?(confirmation)

    EmailCampaigns::ConsentService.new.record!(
      user,
      EmailCampaigns::Campaigns::PhoneConfirmation,
      consented: true,
      always_log: true
    )
    RequestPhoneConfirmationCodeJob.issue_code_and_deliver_later(user)

    render_retry_after(user.phone_confirmation)
  end

  # The phone mirror of request_reconfirm_code_email, for a number that has aged
  # past confirmed_phone_number_expiry.
  def request_reconfirm_code_phone
    authorize current_user, policy_class: RequestCodePolicy

    confirmation = current_user.phone_confirmation

    # The idempotent auto-send keeps its own answer: it asked for a code only if
    # there wasn't one already, which is exactly what happened, so it gets the
    # remaining cooldown rather than a rejection.
    if only_if_first_time? && confirmation&.code_outstanding?
      render_retry_after(confirmation)
      return
    end

    return render_resend_too_soon(confirmation) if resend_too_soon?(confirmation)

    EmailCampaigns::ConsentService.new.record!(
      current_user,
      EmailCampaigns::Campaigns::PhoneConfirmation,
      consented: true,
      always_log: true
    )
    RequestPhoneConfirmationCodeJob.issue_code_and_deliver_later(current_user)

    render_retry_after(current_user.phone_confirmation)
  end

  # This endpoint is used when a logged in user wants to add or change their
  # (verified) phone number. The submitted number is held as a pending
  # new_phone and an SMS confirmation code is sent to it. Re-confirming the
  # number already on the account is request_reconfirm_code_phone's job, not this one.
  def request_code_new_phone
    authorize current_user, policy_class: RequestCodePolicy

    new_phone = request_code_new_phone_params[:new_phone].presence
    if new_phone.blank?
      render json: { errors: { new_phone: [{ error: 'blank' }] } }, status: :unprocessable_entity
      return
    end

    parsed = Phonelib.parse(new_phone)
    if parsed.invalid?
      render json: { errors: { new_phone: [{ error: 'invalid' }] } }, status: :unprocessable_entity
      return
    end

    unless EmailCampaigns::Sms::AllowedCountries.allowed?(parsed.country)
      render json: { errors: { new_phone: [{ error: 'unsupported_country' }] } }, status: :unprocessable_entity
      return
    end

    normalized = parsed.e164

    if User.where.not(id: current_user.id).exists?(phone: normalized)
      render json: { errors: { new_phone: [{ error: 'taken' }] } }, status: :unprocessable_entity
      return
    end

    # Only a code for the number the user is already confirming is a resend; a
    # different number is a new request (the "change your number" path).
    confirmation = current_user.new_phone_confirmation
    resending = normalized == current_user.new_phone
    return render_resend_too_soon(confirmation) if resending && resend_too_soon?(confirmation)

    EmailCampaigns::ConsentService.new.record!(
      current_user,
      EmailCampaigns::Campaigns::NewPhoneConfirmation,
      consented: true,
      always_log: true
    )
    RequestNewPhoneConfirmationCodeJob.issue_code_and_deliver_later(current_user, new_phone: normalized)

    render_retry_after(current_user.new_phone_confirmation)
  end

  private

  def account_merge_offerable?(user)
    AccountMergeEligibilityService.new.source_eligible?(user)
  end

  # Whether the previous code's cooldown still has to run out.
  def resend_too_soon?(confirmation)
    confirmation&.seconds_until_resend_allowed.to_i.positive?
  end

  # Rejects the request, reporting how much of the cooldown is left so the caller
  # can count it down.
  def render_resend_too_soon(confirmation)
    render json: { errors: { base: [{ error: 'too_soon', retry_after: confirmation.seconds_until_resend_allowed }] } },
      status: :too_many_requests
  end

  # Read back from the record rather than assuming a full interval, so a request
  # that deliberately sent nothing still reports the real time left.
  def render_retry_after(confirmation)
    render json: raw_json({ retry_after: confirmation&.seconds_until_resend_allowed.to_i })
  end

  # Whether the caller asked for the idempotent "send only if no code is
  # outstanding" behaviour. Used by the auto-send that fires when the flow lands
  # the user on a re-confirmation step: reopening the modal or recomputing
  # requirements then neither spams the user nor invalidates a code they hold.
  def only_if_first_time?
    ActiveModel::Type::Boolean.new.cast(params.fetch(:request_code, {})[:only_if_first_time])
  end

  def request_code_email_params
    params.require(:request_code).permit(:email)
  end

  def request_code_new_email_params
    params.fetch(:request_code, {}).permit(:new_email)
  end

  def request_code_phone_params
    params.fetch(:request_code, {}).permit(:phone)
  end

  def request_code_new_phone_params
    params.fetch(:request_code, {}).permit(:new_phone)
  end
end
