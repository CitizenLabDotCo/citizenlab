# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Confirmations' do
  explanation 'User can confirm their emails using a 6 digit code'

  before do
    set_api_content_type
  end

  shared_examples 'confirmation code validation' do
    example 'returns an ok status passing the right code' do
      do_request(confirmation: { email: user.email, code: user.email_confirmation.code })
      assert_status 200
    end

    example "logs 'completed_registration' activity job when passed the right code" do
      do_request(confirmation: { email: user.email, code: user.email_confirmation.code })
      expect(LogActivityJob).to have_been_enqueued.with(
        user,
        'completed_registration',
        user,
        a_kind_of(Integer)
      ).exactly(1).times
    end

    example 'returns an auth token when passing the right code' do
      do_request(confirmation: { email: user.email, code: user.email_confirmation.code })
      assert_status 200
      json_response = json_parse response_body
      expect(json_response[:data][:attributes]).to have_key(:auth_token)
      token = json_response[:data][:attributes][:auth_token][:token]
      expect(token[0..2]).to eq 'eyJ' # JWTs start with 'eyJ'
    end

    example 'sets code_reset_count to 0 upon successful confirmation' do
      user.email_confirmation.update!(code_reset_count: 3)
      do_request(confirmation: { email: user.email, code: user.email_confirmation.code })
      assert_status 200
      expect(user.email_confirmation.reload.code_reset_count).to eq 0
    end

    example 'returns an code.blank error code when no code is passed' do
      do_request(confirmation: { email: user.email, code: nil })

      assert_status 422
      json_response = json_parse response_body
      expect(json_response).to include_response_error(:code, 'blank')
    end

    example 'returns an code.invalid error code when the code is invalid' do
      do_request(confirmation: { email: user.email, code: 'badcode' })

      assert_status 422
      json_response = json_parse response_body
      expect(json_response).to include_response_error(:code, 'invalid')
    end

    example "does not log 'completed_registration' activity when the code is invalid" do
      ActiveJob::Base.queue_adapter.enqueued_jobs.clear

      do_request(confirmation: { email: user.email, code: 'badcode' })

      expect(LogActivityJob).not_to have_been_enqueued.with(
        anything,
        'completed_registration',
        anything,
        anything
      )
    end

    example 'does not allow confirming a user without code' do
      code = user.email_confirmation.code
      do_request(confirmation: { email: user.email, code: code })
      assert_status 200

      do_request(confirmation: { email: user.email, code: code })
      assert_status 422
    end

    example 'allows confirming a user already confirmed' do
      code = user.email_confirmation.code
      do_request(confirmation: { email: user.email, code: code })
      assert_status 200

      RequestEmailConfirmationCodeJob.perform_now user
      code = user.reload.email_confirmation.code
      do_request(confirmation: { email: user.email, code: code })
      assert_status 200
    end
  end

  post 'web_api/v1/user/confirm_code_email' do
    with_options scope: :confirmation do
      parameter :email, 'The email address of the user to confirm.'
      parameter :code, 'The 6-digit confirmation code received by email.'
    end

    context 'when email does not exist' do
      let(:user) { create(:unconfirmed_user) }
      let(:email) { 'nonexistent@example.com' }

      before do
        RequestEmailConfirmationCodeJob.perform_now user
      end

      example 'returns a unprocessable entity status when the email does not exist' do
        do_request(confirmation: { email: email, code: '123456' })
        expect(status).to eq 422
      end
    end

    context 'when email exists' do
      let(:user) { create(:unconfirmed_user, password: nil) }

      before do
        RequestEmailConfirmationCodeJob.perform_now user
      end

      include_examples 'confirmation code validation'

      example 'transfers anonymous exposures to the user upon successful confirmation', document: false do
        phase = create(:phase)
        visitor_hash = VisitorHashService.new.generate_for_visitor('192.168.1.1', 'Test Browser')
        anonymous_exposure = create(:idea_exposure, :anonymous, visitor_hash: visitor_hash, phase: phase)

        header 'X-Forwarded-For', '192.168.1.1'
        header 'User-Agent', 'Test Browser'
        do_request(confirmation: { email: user.email, code: user.email_confirmation.code })

        assert_status 200
        anonymous_exposure.reload
        expect(anonymous_exposure.user_id).to eq user.id
        expect(anonymous_exposure.visitor_hash).to be_nil
      end

      example 'allows confirming a user with password that is already confirmed' do
        user_with_password = create(:unconfirmed_user, password: 'password123')
        RequestEmailConfirmationCodeJob.perform_now user_with_password
        code = user_with_password.reload.email_confirmation.code
        do_request(confirmation: { email: user_with_password.email, code: })
        expect(user_with_password.reload).not_to be_confirmation_required

        RequestEmailConfirmationCodeJob.perform_now user_with_password
        expect(user_with_password.reload).not_to be_confirmation_required
        code = user_with_password.reload.email_confirmation.code
        do_request(confirmation: { email: user_with_password.email, code: })
        assert_status 200
      end

      example 'allows confirming a user with password that requires confirmation' do
        user_with_password = create(:unconfirmed_user, password: 'password123')
        RequestEmailConfirmationCodeJob.perform_now user_with_password
        expect(user_with_password).to be_confirmation_required

        code = user_with_password.email_confirmation.code
        do_request(confirmation: { email: user_with_password.email, code: })
        assert_status 200
      end

      example 'returns an unauthorized status when the caller is authenticated' do
        header_token_for create(:user)
        do_request(confirmation: { email: user.email, code: user.email_confirmation.code })

        assert_status 401
        expect(user.reload).to be_confirmation_required
      end
    end
  end

  post 'web_api/v1/user/reconfirm_code_email' do
    with_options scope: :confirmation do
      parameter :code, 'The 6-digit confirmation code received by email.'
    end

    context 'when user is not authenticated' do
      let(:code) { '123456' }

      example_request 'returns an unauthorized status when the user is not authenticated' do
        expect(status).to eq 401
      end
    end

    context 'when user is authenticated' do
      let(:user) { create(:user, password: 'password123', email_confirmed_at: 1.year.ago) }

      before do
        header_token_for user
        RequestEmailConfirmationCodeJob.perform_now user
      end

      # Re-confirmation resets the expiry window by refreshing email_confirmed_at.
      example 'refreshes email_confirmed_at upon successful confirmation' do
        old_confirmed_at = user.email_confirmed_at
        do_request(confirmation: { code: user.reload.email_confirmation.code })

        assert_status 200
        expect(user.reload.email_confirmed_at).to be > old_confirmed_at
      end

      example 'does not return an auth token' do
        do_request(confirmation: { code: user.reload.email_confirmation.code })

        assert_status 200
        expect(response_body).to be_blank
      end

      example 'sets code_reset_count to 0 upon successful confirmation' do
        user.reload.email_confirmation.update!(code_reset_count: 3)
        do_request(confirmation: { code: user.email_confirmation.code })

        assert_status 200
        expect(user.email_confirmation.reload.code_reset_count).to eq 0
      end

      # Unlike confirm_code_email: an account created through SSO must still be
      # able to re-confirm.
      example 'still works when the password_login feature is disabled' do
        code = user.reload.email_confirmation.code
        SettingsService.new.deactivate_feature!('password_login')
        do_request(confirmation: { code: code })

        assert_status 200
      end

      example 'returns an code.blank error code when no code is passed' do
        do_request(confirmation: { code: nil })

        assert_status 422
        json_response = json_parse response_body
        expect(json_response).to include_response_error(:code, 'blank')
      end

      example 'returns an code.invalid error code when the code is invalid' do
        do_request(confirmation: { code: 'badcode' })

        assert_status 422
        json_response = json_parse response_body
        expect(json_response).to include_response_error(:code, 'invalid')
      end

      example 'does not work if the user has no email set' do
        code = user.reload.email_confirmation.code
        user.update!(email: nil)
        do_request(confirmation: { code: code })

        assert_status 422
      end
    end
  end

  post 'web_api/v1/user/confirm_code_new_email' do
    with_options scope: :confirmation do
      parameter :code, 'The 6-digit confirmation code received by email.'
    end

    context 'when user is not authenticated' do
      let(:code) { '123456' }

      example_request 'returns an unauthorized status when the user is not authenticated' do
        expect(status).to eq 401
      end
    end

    context 'when user is authenticated' do
      let(:user) { create(:user, new_email: 'new_email@example.com') }

      before do
        header_token_for user
        RequestNewEmailConfirmationCodeJob.perform_now user, new_email: user.new_email
      end

      example 'updates the user email upon successful confirmation' do
        do_request(confirmation: { code: user.new_email_confirmation.code })
        assert_status 200
        user.reload
        expect(user.email).to eq 'new_email@example.com'
        expect(user.new_email).to be_nil
      end

      example 'sets code_reset_count to 0 upon successful confirmation' do
        user.new_email_confirmation.update!(code_reset_count: 3)
        do_request(confirmation: { code: user.new_email_confirmation.code })
        assert_status 200
        expect(user.new_email_confirmation.reload.code_reset_count).to eq 0
      end

      example 'resets the user JWT upon successful confirmation' do
        do_request(confirmation: { code: user.new_email_confirmation.code })
        assert_status 200

        expect(CGI.unescape(response_headers['Set-Cookie'])).to include('cl2_jwt=')
        expect(user.reload.token_expiry_key).not_to be_nil # It generates a new token expiry code to invalidate old tokens after email change
      end

      example 'returns an code.blank error code when no code is passed' do
        do_request(confirmation: { code: nil })

        assert_status 422
        json_response = json_parse response_body
        expect(json_response).to include_response_error(:code, 'blank')
      end

      example 'returns an code.invalid error code when the code is invalid' do
        do_request(confirmation: { code: 'badcode' })

        assert_status 422
        json_response = json_parse response_body
        expect(json_response).to include_response_error(:code, 'invalid')
      end

      example 'does not work if user has no new_email set' do
        code = user.new_email_confirmation.code
        user.update!(new_email: nil)
        do_request(confirmation: { code: code })
        assert_status 422
      end
    end
  end

  post 'web_api/v1/user/confirm_code_phone' do
    with_options scope: :confirmation do
      parameter :code, 'The 6-digit confirmation code received by SMS.'
      parameter :phone, 'The phone number being confirmed.'
      parameter :sms_manual_campaign_consent, 'Whether the user opts in to receive the manual SMS campaign.', required: false
    end

    context 'when user is not authenticated' do
      include_context 'with stubbed SMS provider'

      let(:user) { create(:unconfirmed_phone_user, phone: '+14155552671') }

      before do
        SettingsService.new.activate_feature!('sms_login')
        RequestPhoneConfirmationCodeJob.issue_code!(user)
        RequestPhoneConfirmationCodeJob.perform_now(user)
      end

      example 'confirms the phone number and returns an auth token' do
        do_request(confirmation: { phone: user.phone, code: user.phone_confirmation.code })
        assert_status 200

        expect(user.reload.phone_confirmed_at).to be_present
        json_response = json_parse response_body
        token = json_response.dig(:data, :attributes, :auth_token, :token)
        expect(token[0..2]).to eq 'eyJ' # JWTs start with 'eyJ'
        expect(JWT.decode(token, nil, false).first['sub']).to eq user.id
      end

      example 'completes the registration' do
        do_request(confirmation: { phone: user.phone, code: user.phone_confirmation.code })
        assert_status 200
        expect(user.reload.registration_completed_at).to be_present
        expect(user).to be_active
      end

      example 'accepts the phone number in a non-canonical format' do
        do_request(confirmation: { phone: '+1 (415) 555-2671', code: user.phone_confirmation.code })
        assert_status 200
        expect(user.reload.phone_confirmed_at).to be_present
      end

      example 'returns a code.invalid error code when the code is invalid' do
        do_request(confirmation: { phone: user.phone, code: '9999' })
        assert_status 422
        expect(user.reload.phone_confirmed_at).to be_nil
      end

      # Mirrors confirm_code_email: with no identifier there is no account to
      # confirm.
      example 'does not work when no phone number is given' do
        do_request(confirmation: { code: user.phone_confirmation.code })
        assert_status 422
        expect(user.reload.phone_confirmed_at).to be_nil
      end

      example 'does not work when no user has that phone number' do
        do_request(confirmation: { phone: '+14155559999', code: user.phone_confirmation.code })
        assert_status 422
      end

      example 'does not work when the sms feature is disabled' do
        SettingsService.new.deactivate_feature!('sms')
        do_request(confirmation: { phone: user.phone, code: user.phone_confirmation.code })
        assert_status 422
        expect(user.reload.phone_confirmed_at).to be_nil
      end

      example 'returns an unauthorized status when the sms_login feature is disabled' do
        SettingsService.new.deactivate_feature!('sms_login')
        do_request(confirmation: { phone: user.phone, code: user.phone_confirmation.code })
        assert_status 401
        expect(user.reload.phone_confirmed_at).to be_nil
      end

      describe 'with claim tokens' do
        let!(:claim_token) { create(:claim_token) }

        before { ClaimTokenService.mark(user, [claim_token.token]) }

        example 'claims the pending participation data' do
          expect(claim_token.item.author_id).to be_nil

          do_request(confirmation: { phone: user.phone, code: user.phone_confirmation.code })
          assert_status 200
          expect(claim_token.item.reload.author_id).to eq user.id
        end
      end

      example 'returns an unauthorized status when the caller is authenticated' do
        header_token_for create(:user)
        do_request(confirmation: { phone: user.phone, code: user.phone_confirmation.code })

        assert_status 401
        expect(user.reload.phone_confirmed_at).to be_nil
      end

      describe 'manual SMS campaign consent' do
        include_context 'with sms manual campaigns feature enabled'

        let(:sms_manual_type) { EmailCampaigns::Campaigns::SmsManual.name }

        example 'records the opt-in given during signup and logs the activity' do
          expect do
            do_request(confirmation: { phone: user.phone, code: user.phone_confirmation.code, sms_manual_campaign_consent: true })
          end.to have_enqueued_job(LogActivityJob)
            .with(an_instance_of(EmailCampaigns::Consent), 'consent_given', user, kind_of(Integer), payload: { campaign_type: sms_manual_type })
          assert_status 200
          consent = EmailCampaigns::Consent.find_by(user: user, campaign_type: sms_manual_type)
          expect(consent.consented).to be true
        end

        example 'records the opt-out when the user leaves the box unchecked' do
          do_request(confirmation: { phone: user.phone, code: user.phone_confirmation.code, sms_manual_campaign_consent: false })
          assert_status 200
          consent = EmailCampaigns::Consent.find_by(user: user, campaign_type: sms_manual_type)
          expect(consent.consented).to be false
        end

        example 'does not record consent when the field is omitted' do
          do_request(confirmation: { phone: user.phone, code: user.phone_confirmation.code })
          assert_status 200
          expect(EmailCampaigns::Consent.where(user: user, campaign_type: sms_manual_type)).to be_empty
        end

        example 'does not record consent when the code is invalid' do
          do_request(confirmation: { phone: user.phone, code: '9999', sms_manual_campaign_consent: true })
          assert_status 422
          expect(EmailCampaigns::Consent.where(user: user, campaign_type: sms_manual_type)).to be_empty
        end

        example 'does not record consent when the sms_manual_campaigns feature is deactivated' do
          SettingsService.new.deactivate_feature!('sms_manual_campaigns')
          do_request(confirmation: { phone: user.phone, code: user.phone_confirmation.code, sms_manual_campaign_consent: true })
          assert_status 200
          expect(EmailCampaigns::Consent.where(user: user, campaign_type: sms_manual_type)).to be_empty
        end
      end
    end
  end

  post 'web_api/v1/user/reconfirm_code_phone' do
    with_options scope: :confirmation do
      parameter :code, 'The 6-digit confirmation code received by SMS.'
    end

    context 'when user is not authenticated' do
      let(:code) { '123456' }

      example_request 'returns an unauthorized status when the user is not authenticated' do
        expect(status).to eq 401
      end
    end

    context 'when user is authenticated' do
      let(:user) { create(:user, phone: '+14155552671', phone_confirmed_at: 1.year.ago) }

      # The code request sends the OTP synchronously, so the provider is invoked.
      include_context 'with stubbed SMS provider'

      before do
        header_token_for user
        RequestPhoneConfirmationCodeJob.issue_code!(user)
        RequestPhoneConfirmationCodeJob.perform_now(user)
      end

      # Re-confirmation resets the expiry window by refreshing phone_confirmed_at.
      example 'refreshes phone_confirmed_at upon successful confirmation' do
        old_confirmed_at = user.phone_confirmed_at
        do_request(confirmation: { code: user.phone_confirmation.code })
        assert_status 200
        expect(user.reload.phone_confirmed_at).to be > old_confirmed_at
      end

      example 'does not return an auth token' do
        do_request(confirmation: { code: user.phone_confirmation.code })
        assert_status 200
        expect(response_body).to be_blank
      end

      # Unlike confirm_code_phone, which is a login path.
      example 'still works when the sms_login and password_login features are disabled' do
        code = user.phone_confirmation.code
        SettingsService.new.deactivate_feature!('sms_login')
        SettingsService.new.deactivate_feature!('password_login')
        do_request(confirmation: { code: code })
        assert_status 200
        expect(user.reload.phone_confirmed_at).to be > 1.year.ago
      end

      example 'does not work when the sms feature is disabled' do
        code = user.phone_confirmation.code
        SettingsService.new.deactivate_feature!('sms')
        do_request(confirmation: { code: code })
        assert_status 422
      end

      example 'sets code_reset_count to 0 upon successful confirmation' do
        user.phone_confirmation.update!(code_reset_count: 3)
        do_request(confirmation: { code: user.phone_confirmation.code })
        assert_status 200
        expect(user.phone_confirmation.reload.code_reset_count).to eq 0
      end

      example 'returns a code.blank error code when no code is passed' do
        do_request(confirmation: { code: nil })
        assert_status 422
        json_response = json_parse response_body
        expect(json_response).to include_response_error(:code, 'blank')
      end

      example 'returns a code.invalid error code when the code is invalid' do
        do_request(confirmation: { code: 'badcode' })
        assert_status 422
        json_response = json_parse response_body
        expect(json_response).to include_response_error(:code, 'invalid')
      end

      example 'does not work if the user has no phone set' do
        code = user.phone_confirmation.code
        user.update!(phone: nil)
        do_request(confirmation: { code: code })
        assert_status 422
      end
    end
  end

  post 'web_api/v1/user/confirm_code_new_phone' do
    with_options scope: :confirmation do
      parameter :code, 'The 6-digit confirmation code received by SMS.'
      parameter :sms_manual_campaign_consent, 'Whether the user opts in to receive the manual SMS campaign.', required: false
    end

    context 'when user is not authenticated' do
      let(:code) { '123456' }

      example_request 'returns an unauthorized status when the user is not authenticated' do
        expect(status).to eq 401
      end
    end

    context 'when user is authenticated' do
      let(:user) { create(:user) }
      let(:new_phone) { '+14155552671' }
      let(:sms_manual_type) { EmailCampaigns::Campaigns::SmsManual.name }

      # The code request sends the OTP synchronously, so the provider is invoked.
      include_context 'with stubbed SMS provider'
      include_context 'with sms manual campaigns feature enabled'

      before do
        header_token_for user
        RequestNewPhoneConfirmationCodeJob.issue_code!(user, new_phone: new_phone)
        RequestNewPhoneConfirmationCodeJob.perform_now(user, new_phone: new_phone)
      end

      example 'promotes new_phone to phone upon successful confirmation' do
        do_request(confirmation: { code: user.new_phone_confirmation.code })
        assert_status 200
        user.reload
        expect(user.phone).to eq new_phone
        expect(user.new_phone).to be_nil
        expect(user.phone_confirmed_at).to be_present
      end

      example 'sets code_reset_count to 0 upon successful confirmation' do
        user.new_phone_confirmation.update!(code_reset_count: 3)
        do_request(confirmation: { code: user.new_phone_confirmation.code })
        assert_status 200
        expect(user.new_phone_confirmation.reload.code_reset_count).to eq 0
      end

      example 'returns a code.blank error code when no code is passed' do
        do_request(confirmation: { code: nil })
        assert_status 422
        json_response = json_parse response_body
        expect(json_response).to include_response_error(:code, 'blank')
      end

      example 'returns a code.invalid error code when the code is invalid' do
        do_request(confirmation: { code: 'badcode' })
        assert_status 422
        json_response = json_parse response_body
        expect(json_response).to include_response_error(:code, 'invalid')
      end

      example 'does not work if the user has no pending phone number' do
        code = user.new_phone_confirmation.code
        user.update!(new_phone: nil)
        do_request(confirmation: { code: code })
        assert_status 422
      end

      example 'records manual SMS campaign consent when the user opts in and logs the activity' do
        expect { do_request(confirmation: { code: user.new_phone_confirmation.code, sms_manual_campaign_consent: true }) }
          .to have_enqueued_job(LogActivityJob)
          .with(an_instance_of(EmailCampaigns::Consent), 'consent_given', user, kind_of(Integer), payload: { campaign_type: sms_manual_type })
        assert_status 200
        consent = EmailCampaigns::Consent.find_by(user: user, campaign_type: sms_manual_type)
        expect(consent.consented).to be true
      end

      example 'records the opt-out when the user does not opt in and logs the activity' do
        expect { do_request(confirmation: { code: user.new_phone_confirmation.code, sms_manual_campaign_consent: false }) }
          .to have_enqueued_job(LogActivityJob)
          .with(an_instance_of(EmailCampaigns::Consent), 'consent_withdrawn', user, kind_of(Integer), payload: { campaign_type: sms_manual_type })
        assert_status 200
        consent = EmailCampaigns::Consent.find_by(user: user, campaign_type: sms_manual_type)
        expect(consent.consented).to be false
      end

      example 'does not record consent when the field is omitted' do
        do_request(confirmation: { code: user.new_phone_confirmation.code })
        assert_status 200
        expect(EmailCampaigns::Consent.where(user: user, campaign_type: sms_manual_type)).to be_empty
      end

      # A form-encoded client sends an empty string for an unchecked checkbox.
      example 'does not record consent when the field is blank' do
        do_request(confirmation: { code: user.new_phone_confirmation.code, sms_manual_campaign_consent: '' })
        assert_status 200
        expect(EmailCampaigns::Consent.where(user: user, campaign_type: sms_manual_type)).to be_empty
      end

      example 'does not record consent when the code is invalid' do
        do_request(confirmation: { code: 'badcode', sms_manual_campaign_consent: true })
        assert_status 422
        expect(EmailCampaigns::Consent.where(user: user, campaign_type: sms_manual_type)).to be_empty
      end

      example 'does not record consent when the sms_manual_campaigns feature is deactivated' do
        SettingsService.new.deactivate_feature!('sms_manual_campaigns')
        do_request(confirmation: { code: user.new_phone_confirmation.code, sms_manual_campaign_consent: true })
        assert_status 200
        expect(EmailCampaigns::Consent.where(user: user, campaign_type: sms_manual_type)).to be_empty
      end
    end
  end
end
