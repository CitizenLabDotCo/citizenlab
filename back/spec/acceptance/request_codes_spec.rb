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
      user.find_or_create_confirmation(:email_confirmation).confirm!
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

    example 'works if user has password and has email confirmed' do
      user = create(:user, email: 'test@test.com')
      expect(user.password_digest).not_to be_nil
      expect(user.confirmation_required?).to be false

      do_request(request_code: { email: user.email })
      expect(response_status).to eq 200
      expect(delivery_service).to have_received(:send_now_to_user)
        .with(an_instance_of(EmailCampaigns::Campaigns::EmailConfirmation), user, hash_including(:code)).once
    end

    # This endpoint serves callers that aren't signed in yet. A signed-in user
    # re-confirming their own email uses request_reconfirm_code_email.
    example 'does not work for an authenticated caller, even for their own email' do
      user = create(:user, email: 'test@test.com')
      header_token_for(user)

      do_request(request_code: { email: user.email })
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
      user.find_or_create_confirmation(:email_confirmation).update!(code_reset_count: 4)

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

    example 'It does not work without an email' do
      do_request(request_code: { email: nil })
      expect(response_status).to eq 401
      expect(delivery_service).not_to have_received(:send_now_to_user)
    end

    # Password-less login/signup lives under the password_login feature. With it
    # off, the tenant is SSO-only and no in-place confirmation code may be requested.
    example 'It does not work if the password_login feature is disabled' do
      SettingsService.new.deactivate_feature!('password_login')
      user = create(:unconfirmed_user, email: 'test@test.com')

      do_request(request_code: { email: user.email })
      expect(response_status).to eq 401
      expect(delivery_service).not_to have_received(:send_now_to_user)
    end
  end

  post 'web_api/v1/user/request_reconfirm_code_email' do
    with_options scope: :request_code do
      parameter :only_if_first_time, 'Only send a code if none is currently outstanding.', required: false
    end

    example 'It does not work for an unauthenticated user' do
      do_request(request_code: {})
      expect(response_status).to eq 401
      expect(delivery_service).not_to have_received(:send_now_to_user)
    end

    example 'It sends a code to the authenticated user own email' do
      user = create(:user, email: 'test@test.com')
      header_token_for(user)

      do_request(request_code: {})
      expect(response_status).to eq 200
      expect(delivery_service).to have_received(:send_now_to_user)
        .with(an_instance_of(EmailCampaigns::Campaigns::EmailConfirmation), user, hash_including(:code)).once
    end

    # Unlike request_code_email: an account created through SSO must still be
    # able to re-confirm.
    example 'It works if the password_login feature is disabled' do
      SettingsService.new.deactivate_feature!('password_login')
      user = create(:user, email: 'test@test.com')
      header_token_for(user)

      do_request(request_code: {})
      expect(response_status).to eq 200
      expect(delivery_service).to have_received(:send_now_to_user)
        .with(an_instance_of(EmailCampaigns::Campaigns::EmailConfirmation), user, hash_including(:code)).once
    end

    example 'It does not work if the user reached code_reset_count' do
      user = create(:user, email: 'test@test.com')
      user.find_or_create_confirmation(:email_confirmation).update!(code_reset_count: 4)
      header_token_for(user)

      do_request(request_code: {})
      expect(response_status).to eq 401
      expect(delivery_service).not_to have_received(:send_now_to_user)
    end

    # only_if_first_time: idempotent auto-send used when the flow lands the user
    # on the re-confirmation step (after confirmed_email_expiry elapsed).
    example 'with only_if_first_time, sends when no code is outstanding' do
      user = create(:user, email: 'test@test.com')
      header_token_for(user)

      do_request(request_code: { only_if_first_time: true })
      expect(response_status).to eq 200
      expect(delivery_service).to have_received(:send_now_to_user)
        .with(an_instance_of(EmailCampaigns::Campaigns::EmailConfirmation), user, hash_including(:code)).once
    end

    example 'with only_if_first_time, does not resend when a code is already outstanding' do
      user = create(:user, email: 'test@test.com')
      header_token_for(user)
      RequestEmailConfirmationCodeJob.perform_now(user) # one code sent in setup
      expect(user.email_confirmation.reload.code).to be_present

      do_request(request_code: { only_if_first_time: true })
      expect(response_status).to eq 200
      # Only the setup code was issued; the only_if_first_time request was a no-op.
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
      user.find_or_create_confirmation(:new_email_confirmation).update!(code_reset_count: 4)
      header_token_for(user)
      do_request(request_code: { new_email: 'new_email@example.com' })
      expect(response_status).to eq 401
      expect(delivery_service).not_to have_received(:send_now_to_user)
    end

    # This caller has an email and a password of its own, so it is not eligible to
    # be merged away - the taken address stays a plain error for it.
    example 'It does not work if new_email is already taken by another user' do
      existing_user = create(:user, email: 'existing_email@example.com')
      user = create(:user)
      header_token_for(user)
      do_request(request_code: { new_email: existing_user.email })
      expect(response_status).to eq 422
      expect(json_response_body).to include_response_error(:new_email, 'is already taken')
      expect(delivery_service).not_to have_received(:send_now_to_user)
    end

    context 'when the caller signed in through an SSO method that gave no email' do
      let(:sso_user) do
        create(:user).tap do |user|
          user.update_columns(email: nil, password_digest: nil)
          create(:identity, user: user, provider: 'clave_unica', uid: '11111')
        end
      end

      example 'It offers an account merge instead of failing on a taken address' do
        existing_user = create(:user, email: 'existing_email@example.com')
        header_token_for(sso_user)

        do_request(request_code: { new_email: existing_user.email })

        expect(response_status).to eq 200
        expect(response_data[:attributes][:confirmation_type]).to eq 'merge_account'
        expect(delivery_service).to have_received(:send_now_to_user)
          .with(
            an_instance_of(EmailCampaigns::Campaigns::MergeAccountConfirmation),
            sso_user,
            hash_including(code: anything, email: existing_user.email)
          ).once

        confirmation = sso_user.reload.merge_account_confirmation
        expect(confirmation.target_email).to eq existing_user.email
        # The address belongs to someone else, so it must never land on new_email.
        expect(sso_user.new_email).to be_nil
      end

      # Whether the target may actually be merged into is settled at confirm time.
      # Refusing here would tell an unauthenticated prober which addresses belong
      # to admins; the code goes to the admin's own inbox, so nothing leaks.
      example 'It gives the same answer when the address belongs to an admin' do
        admin = create(:admin, email: 'admin_email@example.com')
        header_token_for(sso_user)

        do_request(request_code: { new_email: admin.email })

        expect(response_status).to eq 200
        expect(response_data[:attributes][:confirmation_type]).to eq 'merge_account'
      end

      example 'It still starts an ordinary confirmation for an unused address' do
        header_token_for(sso_user)

        do_request(request_code: { new_email: 'nobody@example.com' })

        expect(response_status).to eq 200
        expect(response_data[:attributes][:confirmation_type]).to eq 'new_email'
        expect(sso_user.reload.new_email).to eq 'nobody@example.com'
      end
    end
  end

  post 'web_api/v1/user/request_code_phone' do
    with_options scope: :request_code do
      parameter :phone, 'The phone number to send the code to.', required: true
    end

    include_context 'with sms feature enabled'

    before { SettingsService.new.activate_feature!('sms_login') }

    example 'It works for an unauthenticated user that submits a phone number' do
      user = create(:unconfirmed_phone_user, phone: '+14155552671')

      expect { do_request(request_code: { phone: '+1 (415) 555-2671' }) }
        .to enqueue_job(RequestPhoneConfirmationCodeJob).with(user).once
      expect(response_status).to eq 200
      # Only the delivery is queued; the code itself is issued before the response.
      expect(user.reload.phone_confirmation.code).to be_present
    end

    example 'It reports how long the caller has to wait before requesting another code' do
      create(:unconfirmed_phone_user, phone: '+14155552671')

      do_request(request_code: { phone: '+14155552671' })
      expect(response_status).to eq 200
      expect(response_data.dig(:attributes, :retry_after)).to eq 60
    end

    example 'It does not send another code within a minute of the previous one' do
      user = create(:unconfirmed_phone_user, phone: '+14155552671')
      RequestPhoneConfirmationCodeJob.issue_code!(user)

      expect { do_request(request_code: { phone: '+14155552671' }) }
        .not_to enqueue_job(RequestPhoneConfirmationCodeJob)
      expect(response_status).to eq 429
      expect(json_response_body).to include_response_error(:base, 'too_soon')
      expect(json_response_body.dig(:errors, :base, 0, :retry_after)).to be_between(1, 60)
    end

    example 'It sends another code once the interval has elapsed' do
      user = create(:unconfirmed_phone_user, phone: '+14155552671')
      RequestPhoneConfirmationCodeJob.issue_code!(user)

      travel_to(61.seconds.from_now) do
        expect { do_request(request_code: { phone: '+14155552671' }) }
          .to enqueue_job(RequestPhoneConfirmationCodeJob).with(user).once
        expect(response_status).to eq 200
      end
    end

    example 'It records the consent to receive a confirmation code by SMS and logs the activity' do
      user = create(:unconfirmed_phone_user, phone: '+14155552671')

      expect { do_request(request_code: { phone: '+14155552671' }) }
        .to have_enqueued_job(LogActivityJob)
        .with(
          an_instance_of(EmailCampaigns::Consent),
          'consent_given',
          user,
          kind_of(Integer),
          payload: { campaign_type: EmailCampaigns::Campaigns::PhoneConfirmation.name }
        )
      expect(response_status).to eq 200

      consent = EmailCampaigns::Consent.find_by(
        user_id: user.id,
        campaign_type: EmailCampaigns::Campaigns::PhoneConfirmation.name
      )
      expect(consent.consented).to be true
    end

    # A user who replied STOP and then asks for a code again is opting back in.
    example 'It records the consent again after a withdrawal' do
      user = create(:unconfirmed_phone_user, phone: '+14155552671')
      create(
        :consent,
        user: user,
        campaign_type: EmailCampaigns::Campaigns::PhoneConfirmation.name,
        consented: false
      )

      do_request(request_code: { phone: '+14155552671' })
      expect(response_status).to eq 200

      consent = EmailCampaigns::Consent.find_by(
        user_id: user.id,
        campaign_type: EmailCampaigns::Campaigns::PhoneConfirmation.name
      )
      expect(consent.consented).to be true
    end

    example 'It does not record consent when the request is rejected' do
      create(:user, :with_confirmed_phone, phone: '+14155552671')
      header_token_for(create(:user, :with_confirmed_phone, phone: '+14155552672'))

      expect { do_request(request_code: { phone: '+14155552671' }) }
        .not_to change(EmailCampaigns::Consent, :count)
      expect(response_status).to eq 401
    end

    example 'It does not work without a phone number' do
      expect { do_request(request_code: {}) }.not_to enqueue_job(RequestPhoneConfirmationCodeJob)
      expect(response_status).to eq 401
    end

    example 'It does not work if no user has that phone number' do
      expect { do_request(request_code: { phone: '+14155552671' }) }
        .not_to enqueue_job(RequestPhoneConfirmationCodeJob)
      expect(response_status).to eq 401
    end

    # This endpoint serves callers that aren't signed in yet. A signed-in user
    # re-confirming their own number uses request_reconfirm_code_phone.
    example 'It does not work for an authenticated caller, even for their own number' do
      user = create(:user, :with_confirmed_phone, phone: '+14155552671')
      header_token_for(user)

      expect { do_request(request_code: { phone: '+14155552671' }) }
        .not_to enqueue_job(RequestPhoneConfirmationCodeJob)
      expect(response_status).to eq 401
    end

    example 'It does not work if the user reached code_reset_count' do
      user = create(:unconfirmed_phone_user, phone: '+14155552671')
      user.find_or_create_confirmation(:phone_confirmation).update!(code_reset_count: 4)

      expect { do_request(request_code: { phone: '+14155552671' }) }
        .not_to enqueue_job(RequestPhoneConfirmationCodeJob)
      expect(response_status).to eq 401
    end

    example 'It does not work if the SMS feature is disabled' do
      SettingsService.new.deactivate_feature!('sms')
      create(:unconfirmed_phone_user, phone: '+14155552671')

      expect { do_request(request_code: { phone: '+14155552671' }) }
        .not_to enqueue_job(RequestPhoneConfirmationCodeJob)
      expect(response_status).to eq 401
    end

    example 'It does not work if the sms_login feature is disabled' do
      SettingsService.new.deactivate_feature!('sms_login')
      create(:unconfirmed_phone_user, phone: '+14155552671')

      expect { do_request(request_code: { phone: '+14155552671' }) }
        .not_to enqueue_job(RequestPhoneConfirmationCodeJob)
      expect(response_status).to eq 401
    end

    # Phone confirmation codes are part of the password-less login/signup flow,
    # which lives under the password_login feature. With it off, the tenant is
    # SSO-only and no in-place confirmation code may be requested.
    example 'It does not work if the password_login feature is disabled' do
      SettingsService.new.deactivate_feature!('password_login')
      create(:unconfirmed_phone_user, phone: '+14155552671')

      expect { do_request(request_code: { phone: '+14155552671' }) }
        .not_to enqueue_job(RequestPhoneConfirmationCodeJob)
      expect(response_status).to eq 401
    end
  end

  post 'web_api/v1/user/request_reconfirm_code_phone' do
    with_options scope: :request_code do
      parameter :only_if_first_time, 'Only send a code if none is currently outstanding.', required: false
    end

    include_context 'with sms feature enabled'

    example 'It does not work for an unauthenticated user' do
      expect { do_request(request_code: {}) }.not_to enqueue_job(RequestPhoneConfirmationCodeJob)
      expect(response_status).to eq 401
    end

    example 'It sends a code to the authenticated user own number' do
      user = create(:user, :with_confirmed_phone)
      header_token_for(user)

      expect { do_request(request_code: {}) }
        .to enqueue_job(RequestPhoneConfirmationCodeJob).with(user).once
      expect(response_status).to eq 200
      # Only the delivery is queued; the code itself is issued before the response.
      expect(user.reload.phone_confirmation.code).to be_present
    end

    example 'It does not send another code within a minute of the previous one' do
      user = create(:user, :with_confirmed_phone)
      RequestPhoneConfirmationCodeJob.issue_code!(user)
      header_token_for(user)

      expect { do_request(request_code: {}) }.not_to enqueue_job(RequestPhoneConfirmationCodeJob)
      expect(response_status).to eq 429
      expect(json_response_body).to include_response_error(:base, 'too_soon')
    end

    example 'It sends another code once the interval has elapsed' do
      user = create(:user, :with_confirmed_phone)
      RequestPhoneConfirmationCodeJob.issue_code!(user)
      header_token_for(user)

      travel_to(61.seconds.from_now) do
        expect { do_request(request_code: {}) }
          .to enqueue_job(RequestPhoneConfirmationCodeJob).with(user).once
        expect(response_status).to eq 200
      end
    end

    example 'It records the consent to receive a confirmation code by SMS and logs the activity' do
      user = create(:user, :with_confirmed_phone)
      header_token_for(user)

      expect { do_request(request_code: {}) }
        .to have_enqueued_job(LogActivityJob)
        .with(
          an_instance_of(EmailCampaigns::Consent),
          'consent_given',
          user,
          kind_of(Integer),
          payload: { campaign_type: EmailCampaigns::Campaigns::PhoneConfirmation.name }
        )
      expect(response_status).to eq 200

      consent = EmailCampaigns::Consent.find_by(
        user_id: user.id,
        campaign_type: EmailCampaigns::Campaigns::PhoneConfirmation.name
      )
      expect(consent.consented).to be true
    end

    # Unlike request_code_phone, which is a login path.
    example 'It works if the sms_login and password_login features are disabled' do
      SettingsService.new.deactivate_feature!('sms_login')
      SettingsService.new.deactivate_feature!('password_login')
      user = create(:user, :with_confirmed_phone)
      header_token_for(user)

      expect { do_request(request_code: {}) }
        .to enqueue_job(RequestPhoneConfirmationCodeJob).with(user).once
      expect(response_status).to eq 200
    end

    example 'It does not work if the SMS feature is disabled' do
      SettingsService.new.deactivate_feature!('sms')
      user = create(:user, :with_confirmed_phone)
      header_token_for(user)

      expect { do_request(request_code: {}) }.not_to enqueue_job(RequestPhoneConfirmationCodeJob)
      expect(response_status).to eq 401
    end

    example 'It does not work if the user has no phone number' do
      user = create(:user)
      expect(user.phone).to be_nil
      header_token_for(user)

      expect { do_request(request_code: {}) }.not_to enqueue_job(RequestPhoneConfirmationCodeJob)
      expect(response_status).to eq 401
    end

    example 'It does not work if the user reached code_reset_count' do
      user = create(:user, :with_confirmed_phone)
      user.find_or_create_confirmation(:phone_confirmation).update!(code_reset_count: 4)
      header_token_for(user)

      expect { do_request(request_code: {}) }.not_to enqueue_job(RequestPhoneConfirmationCodeJob)
      expect(response_status).to eq 401
    end

    # only_if_first_time: idempotent auto-send used when the flow lands the user
    # on the phone re-confirmation step.
    example 'with only_if_first_time, sends when no code is outstanding' do
      user = create(:user, :with_confirmed_phone)
      expect(user.phone_confirmation).to be_nil
      header_token_for(user)

      expect { do_request(request_code: { only_if_first_time: true }) }
        .to enqueue_job(RequestPhoneConfirmationCodeJob).with(user).once
      expect(response_status).to eq 200
    end

    example 'with only_if_first_time, does not resend when a code is already outstanding' do
      user = create(:user, :with_confirmed_phone)
      header_token_for(user)
      RequestPhoneConfirmationCodeJob.issue_code!(user) # one code issued in setup
      expect(user.phone_confirmation.reload.code).to be_present

      # Only the setup code was issued; the only_if_first_time request was a no-op.
      expect { do_request(request_code: { only_if_first_time: true }) }
        .not_to enqueue_job(RequestPhoneConfirmationCodeJob)
      expect(response_status).to eq 200
      expect(response_data.dig(:attributes, :retry_after)).to be_between(1, 60)
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
      expect { do_request(request_code: { new_phone: '+1 415 555 2671' }) }
        .to enqueue_job(RequestNewPhoneConfirmationCodeJob).with(user, new_phone: '+14155552671').once
      expect(response_status).to eq 200
      expect(user.reload.new_phone).to eq '+14155552671'
      # Only the delivery is queued; the code itself is issued before the response.
      expect(user.new_phone_confirmation.code).to be_present
    end

    example 'It does not send another code for the same number within a minute' do
      user = create(:user)
      header_token_for(user)
      do_request(request_code: { new_phone: '+1 415 555 2671' })
      expect(response_status).to eq 200
      expect(response_data.dig(:attributes, :retry_after)).to eq 60

      expect { do_request(request_code: { new_phone: '+1 415 555 2671' }) }
        .not_to enqueue_job(RequestNewPhoneConfirmationCodeJob)
      expect(response_status).to eq 429
      expect(json_response_body).to include_response_error(:base, 'too_soon')
    end

    # The interval is about resending the same code, not about the number the user
    # is asking for - correcting a mistyped number should not have to wait.
    example 'It sends a code for a different number right away' do
      user = create(:user)
      header_token_for(user)
      do_request(request_code: { new_phone: '+1 415 555 2671' })
      expect(response_status).to eq 200

      expect { do_request(request_code: { new_phone: '+1 415 555 2680' }) }
        .to enqueue_job(RequestNewPhoneConfirmationCodeJob).with(user, new_phone: '+14155552680').once
      expect(response_status).to eq 200
      expect(user.reload.new_phone).to eq '+14155552680'
    end

    example 'It records the consent to receive a confirmation code by SMS and logs the activity' do
      user = create(:user)
      header_token_for(user)
      expect { do_request(request_code: { new_phone: '+1 415 555 2671' }) }
        .to have_enqueued_job(LogActivityJob)
        .with(
          an_instance_of(EmailCampaigns::Consent),
          'consent_given',
          user,
          kind_of(Integer),
          payload: { campaign_type: EmailCampaigns::Campaigns::NewPhoneConfirmation.name }
        )
      expect(response_status).to eq 200

      consent = EmailCampaigns::Consent.find_by(
        user_id: user.id,
        campaign_type: EmailCampaigns::Campaigns::NewPhoneConfirmation.name
      )
      expect(consent.consented).to be true
    end

    example 'It logs a consent event on every submission, keeping a single consent record' do
      user = create(:user)
      header_token_for(user)
      do_request(request_code: { new_phone: '+1 415 555 2671' })
      expect(response_status).to eq 200

      expect { do_request(request_code: { new_phone: '+1 415 555 2680' }) }
        .to have_enqueued_job(LogActivityJob)
        .with(
          an_instance_of(EmailCampaigns::Consent),
          'consent_given',
          user,
          kind_of(Integer),
          payload: { campaign_type: EmailCampaigns::Campaigns::NewPhoneConfirmation.name }
        )
      expect(response_status).to eq 200

      expect(EmailCampaigns::Consent.where(
        user_id: user.id, campaign_type: EmailCampaigns::Campaigns::NewPhoneConfirmation.name
      ).count).to eq 1
    end

    example 'It does not record consent when the phone number is rejected' do
      user = create(:user)
      header_token_for(user)
      expect { do_request(request_code: { new_phone: 'not-a-number' }) }
        .not_to change(EmailCampaigns::Consent, :count)
      expect(response_status).to eq 422
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

    example 'It does not work if the phone number is in a country that is not allowed' do
      SettingsService.new.activate_feature!('sms', settings: { 'allowed_country_codes' => ['BE'] })
      user = create(:user)
      header_token_for(user)
      expect { do_request(request_code: { new_phone: '+14155552671' }) } # US number
        .not_to enqueue_job(RequestNewPhoneConfirmationCodeJob)
      expect(response_status).to eq 422
      expect(json_response_body).to include_response_error(:new_phone, 'unsupported_country')
    end

    example 'It works if the phone number is in an allowed country' do
      SettingsService.new.activate_feature!('sms', settings: { 'allowed_country_codes' => ['US'] })
      user = create(:user)
      header_token_for(user)
      expect { do_request(request_code: { new_phone: '+14155552671' }) }
        .to enqueue_job(RequestNewPhoneConfirmationCodeJob).with(user, new_phone: '+14155552671').once
      expect(response_status).to eq 200
      expect(user.reload.new_phone).to eq '+14155552671'
    end

    example 'It does not work if the user reached code_reset_count' do
      user = create(:user)
      user.find_or_create_confirmation(:new_phone_confirmation).update!(code_reset_count: 4)
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
  end
end
