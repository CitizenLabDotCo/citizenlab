# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Confirmations' do
  explanation 'User can confirm their emails using a 4 digit code'

  before do
    set_api_content_type
    SettingsService.new.activate_feature! 'user_confirmation'
  end

  shared_examples 'confirmation code validation' do
    example 'returns an ok status passing the right code' do
      do_request(confirmation: { email: user.email, code: user.email_confirmation_code })
      assert_status 200
    end

    example "logs 'completed_registration' activity job when passed the right code" do
      do_request(confirmation: { email: user.email, code: user.email_confirmation_code })
      expect(LogActivityJob).to have_been_enqueued.with(
        user,
        'completed_registration',
        user,
        user.updated_at.to_i
      ).exactly(1).times
    end

    example 'returns an auth token when passing the right code' do
      do_request(confirmation: { email: user.email, code: user.email_confirmation_code })
      assert_status 200
      json_response = json_parse response_body
      expect(json_response[:data][:attributes]).to have_key(:auth_token)
      token = json_response[:data][:attributes][:auth_token][:token]
      expect(token[0..2]).to eq 'eyJ' # JWTs start with 'eyJ'
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

    example 'does not allow confirming a user already confirmed' do
      code = user.email_confirmation_code
      do_request(confirmation: { email: user.email, code: code })
      assert_status 200
      do_request(confirmation: { email: user.email, code: code })
      assert_status 422
    end
  end

  post 'web_api/v1/user/confirm_code_unauthenticated' do
    with_options scope: :confirmation do
      parameter :email, 'The email address of the user to confirm.'
      parameter :code, 'The 4-digit confirmation code received by email.'
    end

    context 'when email does not exist' do
      let(:user) { create(:user_with_confirmation) }
      let(:email) { 'nonexistent@example.com' }

      before do
        RequestConfirmationCodeJob.perform_now user
      end

      example 'returns a not found status when the email does not exist' do
        do_request(confirmation: { email: email, code: '1234' })
        expect(status).to eq 422
      end
    end

    context 'when email exists' do
      let(:user) { create(:user_with_confirmation, password: nil) }

      before do
        RequestConfirmationCodeJob.perform_now user
      end

      include_examples 'confirmation code validation'

      example 'does not allow confirming a user with password' do
        user_with_password = create(:user_with_confirmation, password: 'password123')
        code = user_with_password.email_confirmation_code
        do_request(confirmation: { email: user_with_password.email, code: })
        assert_status 422
      end
    end
  end

  post 'web_api/v1/user/confirm_code_authenticated' do
    with_options scope: :confirmation do
      parameter :code, 'The 4-digit confirmation code received by email.'
    end

    context 'when user is not authenticated' do
      let(:user) { create(:user_with_confirmation, password: 'password123') }

      example 'returns an unauthorized status when the user is not authenticated' do
        do_request(confirmation: { code: '1234' })
        expect(status).to eq 401
      end
    end

    context 'when user is authenticated' do
      let(:user) { create(:user_with_confirmation, password: 'password123') }

      before do
        header_token_for user
        RequestConfirmationCodeJob.perform_now user
      end

      include_examples 'confirmation code validation'

      example 'allows confirming a user without password' do
        user_without_password = create(:user_with_confirmation, password: nil)
        header_token_for(user_without_password)
        RequestConfirmationCodeJob.perform_now user_without_password

        code = user_without_password.email_confirmation_code
        do_request(confirmation: { code: code })
        assert_status 200
      end
    end
  end

  post 'web_api/v1/user/confirm_code_email_change' do
    with_options scope: :confirmation do
      parameter :code, 'The 4-digit confirmation code received by email.'
    end

    context 'when user is not authenticated' do
      let(:user) { create(:user, new_email: 'new_email@example.com') }

      example 'returns an unauthorized status when the user is not authenticated' do
        do_request(confirmation: { code: '1234' })
        expect(status).to eq 401
      end
    end

    context 'when user is authenticated' do
      let(:user) { create(:user, new_email: 'new_email@example.com') }

      before do
        header_token_for user
        RequestConfirmationCodeJob.perform_now user, new_email: user.new_email
      end

      example 'updates the user email upon successful confirmation' do
        do_request(confirmation: { code: user.email_confirmation_code })
        assert_status 200
        user.reload
        expect(user.email).to eq 'new_email@example.com'
        expect(user.new_email).to be_nil
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
        user.update!(new_email: nil)
        do_request(confirmation: { code: user.email_confirmation_code })
        assert_status 422
      end
    end
  end
end
