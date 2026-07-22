# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Request codes' do
  before { set_api_content_type }

  # The confirmation code emails are sent through the EmailCampaigns engine via
  # DeliveryService#send_now_to_user. We spy on it to assert whether a code was
  # (or was not) sent, without actually rendering/delivering an email.
  let(:delivery_service) { instance_spy(EmailCampaigns::DeliveryService) }

  before do
    allow(EmailCampaigns::DeliveryService).to receive(:new).and_return(delivery_service)
  end

  post 'web_api/v1/user/request_code_email' do
    with_options scope: :request_code do
      parameter :email, 'The email of the user requesting a confirmation code.', required: true
    end

    example 'works if user has no password and has email confirmed' do
      user = create(:unconfirmed_user, email: 'test@test.com')
      user.email_confirmation.confirm!
      expect(user.password_digest).to be_nil
      expect(user.confirmation_required?).to be false

      do_request(request_code: { email: user.email })
      expect(response_status).to eq 200
      expect(delivery_service).to have_received(:send_now_to_user)
        .with(an_instance_of(EmailCampaigns::Campaigns::EmailConfirmation), user, hash_including(:code)).once
      # Requesting a new code should not reset the confirmation_required value
      expect(user.reload.confirmation_required?).to be false
    end

    example 'works if user has no password and does not have email confirmed' do
      user = create(:unconfirmed_user, email: 'test@test.com')
      expect(user.password_digest).to be_nil
      expect(user.confirmation_required?).to be true

      do_request(request_code: { email: user.email })
      expect(response_status).to eq 200
      expect(delivery_service).to have_received(:send_now_to_user)
        .with(an_instance_of(EmailCampaigns::Campaigns::EmailConfirmation), user, hash_including(:code)).once
    end

    example 'does not work if user has password and has email confirmed' do
      user = create(:user, email: 'test@test.com')
      expect(user.password_digest).not_to be_nil
      expect(user.confirmation_required?).to be false

      do_request(request_code: { email: user.email })
      expect(response_status).to eq 401
      expect(delivery_service).not_to have_received(:send_now_to_user)
    end

    # Re-confirmation: an authenticated user whose confirmed email has aged past
    # confirmed_email_expiry requests a fresh code for their own email. This is
    # the same "full account" (password set + confirmed) that is rejected for
    # unauthenticated callers above, but allowed here because they are the owner.
    example 'works for an authenticated user requesting a code for their own email' do
      user = create(:user, email: 'test@test.com')
      expect(user.password_digest).not_to be_nil
      expect(user.confirmation_required?).to be false
      header_token_for(user)

      do_request(request_code: { email: user.email })
      expect(response_status).to eq 200
      expect(delivery_service).to have_received(:send_now_to_user)
        .with(an_instance_of(EmailCampaigns::Campaigns::EmailConfirmation), user, hash_including(:code)).once
    end

    # An authenticated user must not be able to request an in-place confirmation
    # code for a *different* existing account's email; the owner check is on the
    # record, not merely on being logged in.
    example 'does not work for an authenticated user requesting a code for a different confirmed account' do
      other_user = create(:user, email: 'other@test.com')
      requester = create(:user, email: 'requester@test.com')
      header_token_for(requester)

      do_request(request_code: { email: other_user.email })
      expect(response_status).to eq 401
      expect(delivery_service).not_to have_received(:send_now_to_user)
    end

    # This is an edge case related to legacy users, where a user has a password set
    # but has not confirmed their email yet. This should not be possible anymore.
    example 'works if user has password and does not have email confirmed' do
      user = create(:unconfirmed_user, email: 'test@test.com', password_digest: 'super_secret')
      expect(user.password_digest).not_to be_nil
      expect(user.confirmation_required?).to be true

      do_request(request_code: { email: user.email })
      expect(response_status).to eq 200
      expect(delivery_service).to have_received(:send_now_to_user)
        .with(an_instance_of(EmailCampaigns::Campaigns::EmailConfirmation), user, hash_including(:code)).once
    end

    example 'It does not work if user reached code_reset_count' do
      user = create(:unconfirmed_user)
      user.email_confirmation.update!(code_reset_count: 4)

      do_request(request_code: { email: user.email })
      expect(response_status).to eq 401
      expect(delivery_service).not_to have_received(:send_now_to_user)
    end

    # In the past this endpoint did not allow requesting a code
    # when new_email was selected for tech debt reasons.
    # But this was causing other problems, so now it's allowed.
    # I just changed the test and left it to make sure that this keeps
    # working.
    example 'It works if new_email is present' do
      user = create(:unconfirmed_user, new_email: 'new@email.com')
      expect(user.new_email).to eq 'new@email.com'

      do_request(request_code: { email: user.email })
      expect(response_status).to eq 200
      expect(delivery_service).to have_received(:send_now_to_user)
        .with(an_instance_of(EmailCampaigns::Campaigns::EmailConfirmation), user, hash_including(:code)).once
    end

    # only_if_first_time: idempotent auto-send used when the flow lands an authenticated
    # user on the confirmation step (re-confirmation after confirmed_email_expiry).
    example 'with only_if_first_time, sends when no code is outstanding' do
      user = create(:user, email: 'test@test.com')
      user.email_confirmation.clear_code!
      header_token_for(user)

      do_request(request_code: { email: user.email, only_if_first_time: true })
      expect(response_status).to eq 200
      expect(delivery_service).to have_received(:send_now_to_user)
        .with(an_instance_of(EmailCampaigns::Campaigns::EmailConfirmation), user, hash_including(:code)).once
    end

    example 'with only_if_first_time, does not resend when a code is already outstanding' do
      user = create(:user, email: 'test@test.com')
      header_token_for(user)
      RequestEmailConfirmationCodeJob.perform_now(user) # one code sent in setup
      expect(user.email_confirmation.reload.code).to be_present

      do_request(request_code: { email: user.email, only_if_first_time: true })
      expect(response_status).to eq 200
      # Only the setup send happened; the only_if_first_time request was a no-op.
      expect(delivery_service).to have_received(:send_now_to_user)
        .with(an_instance_of(EmailCampaigns::Campaigns::EmailConfirmation), user, hash_including(:code)).once
    end

    example 'an authenticated user can omit the email (uses current_user)' do
      user = create(:user, email: 'test@test.com')
      user.email_confirmation.clear_code!
      header_token_for(user)

      do_request(request_code: { only_if_first_time: true })
      expect(response_status).to eq 200
      expect(delivery_service).to have_received(:send_now_to_user)
        .with(an_instance_of(EmailCampaigns::Campaigns::EmailConfirmation), user, hash_including(:code)).once
    end
  end

  post 'web_api/v1/user/request_code_new_email' do
    with_options scope: :request_code do
      parameter :new_email, 'The email of the user requesting a confirmation code.', required: false
    end

    example 'It works with authenticated user' do
      user = create(:user)
      header_token_for(user)
      do_request(request_code: { new_email: 'new_email@example.com' })
      expect(response_status).to eq 200
      expect(delivery_service).to have_received(:send_now_to_user)
        .with(an_instance_of(EmailCampaigns::Campaigns::NewEmailConfirmation), user, hash_including(:code)).once
      expect(user.reload.new_email).to eq 'new_email@example.com'
    end

    example 'It does not work if new_email is blank and new_email is not yet set on user' do
      user = create(:user)
      header_token_for(user)
      do_request(request_code: { new_email: '' })
      expect(response_status).to eq 422
      expect(json_response_body).to include_response_error(:new_email, 'cannot be blank')
      expect(delivery_service).not_to have_received(:send_now_to_user)
    end

    example 'It works if new_email is blank but new_email is already set on user' do
      user = create(:user, new_email: 'new@email.com')
      header_token_for(user)
      do_request(request_code: { new_email: '' })
      expect(response_status).to eq 200
      expect(delivery_service).to have_received(:send_now_to_user)
        .with(an_instance_of(EmailCampaigns::Campaigns::NewEmailConfirmation), user, hash_including(:code)).once
      expect(user.reload.new_email).to eq 'new@email.com'
    end

    example 'It works if request_code is an empty object but new_email is already set on user' do
      user = create(:user, new_email: 'new@email.com')
      header_token_for(user)
      do_request(request_code: {})
      expect(response_status).to eq 200
      expect(delivery_service).to have_received(:send_now_to_user)
        .with(an_instance_of(EmailCampaigns::Campaigns::NewEmailConfirmation), user, hash_including(:code)).once
      expect(user.reload.new_email).to eq 'new@email.com'
    end

    example 'It does not work if user reached code_reset_count' do
      user = create(:user)
      user.new_email_confirmation.update!(code_reset_count: 4)
      header_token_for(user)
      do_request(request_code: { new_email: 'new_email@example.com' })
      expect(response_status).to eq 401
      expect(delivery_service).not_to have_received(:send_now_to_user)
    end

    example 'It does not work if new_email is already taken by another user' do
      existing_user = create(:user, email: 'existing_email@example.com')
      user = create(:user)
      header_token_for(user)
      do_request(request_code: { new_email: existing_user.email })
      expect(response_status).to eq 422
      expect(json_response_body).to include_response_error(:new_email, 'is already taken')
      expect(delivery_service).not_to have_received(:send_now_to_user)
    end
  end

  post 'web_api/v1/user/request_code_new_phone' do
    with_options scope: :request_code do
      parameter :new_phone, 'The phone number the user wants to verify.', required: true
    end

    include_context 'with sms feature enabled'

    example 'It works for an authenticated user and stores the pending number' do
      user = create(:user)
      header_token_for(user)
      do_request(request_code: { new_phone: '+1 415 555 2671' })
      expect(response_status).to eq 200
      expect(user.reload.new_phone).to eq '+14155552671'
      expect(delivery_service).to have_received(:send_now_to_user)
        .with(an_instance_of(EmailCampaigns::Campaigns::NewPhoneConfirmation), user, hash_including(:code)).once
    end

    example 'It does not work if new_phone is blank' do
      user = create(:user)
      header_token_for(user)
      do_request(request_code: { new_phone: '' })
      expect(response_status).to eq 422
      expect(json_response_body).to include_response_error(:new_phone, 'blank')
    end

    example 'It does not work for an invalid phone number' do
      user = create(:user)
      header_token_for(user)
      do_request(request_code: { new_phone: 'not-a-number' })
      expect(response_status).to eq 422
      expect(json_response_body).to include_response_error(:new_phone, 'invalid')
    end

    example 'It does not work if the phone number is already taken by another user' do
      create(:user, phone: '+14155552671', phone_confirmed_at: Time.zone.now)
      user = create(:user)
      header_token_for(user)
      do_request(request_code: { new_phone: '+14155552671' })
      expect(response_status).to eq 422
      expect(json_response_body).to include_response_error(:new_phone, 'taken')
    end

    example 'It does not work if the user reached code_reset_count' do
      user = create(:user)
      user.new_phone_confirmation.update!(code_reset_count: 4)
      header_token_for(user)
      do_request(request_code: { new_phone: '+14155552671' })
      expect(response_status).to eq 401
    end

    example 'It does not work if the SMS feature is disabled' do
      SettingsService.new.deactivate_feature!('sms')
      user = create(:user)
      header_token_for(user)
      do_request(request_code: { new_phone: '+14155552671' })
      expect(response_status).to eq 401
    end

    # only_if_first_time: for re-confirmation the number is omitted and the endpoint falls
    # back to the user's own phone, sending only when no code is outstanding.
    example 'with only_if_first_time and no new_phone, sends to the existing phone' do
      user = create(:user, phone: '+14155552671', phone_confirmed_at: Time.zone.now)
      header_token_for(user)

      do_request(request_code: { only_if_first_time: true })
      expect(response_status).to eq 200
      expect(user.reload.new_phone).to eq '+14155552671'
      expect(delivery_service).to have_received(:send_now_to_user)
        .with(an_instance_of(EmailCampaigns::Campaigns::NewPhoneConfirmation), user, hash_including(:code)).once
    end

    example 'with only_if_first_time, does not resend when a code is already outstanding' do
      user = create(:user, phone: '+14155552671', phone_confirmed_at: Time.zone.now)
      header_token_for(user)
      RequestNewPhoneConfirmationCodeJob.perform_now(user, new_phone: '+14155552671') # one code sent in setup
      expect(user.new_phone_confirmation.reload.code).to be_present

      do_request(request_code: { only_if_first_time: true })
      expect(response_status).to eq 200
      expect(delivery_service).to have_received(:send_now_to_user)
        .with(an_instance_of(EmailCampaigns::Campaigns::NewPhoneConfirmation), user, hash_including(:code)).once
    end
  end
end
