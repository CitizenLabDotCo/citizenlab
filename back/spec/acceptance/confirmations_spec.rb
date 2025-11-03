# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Confirmations' do
  explanation 'User can confirm their emails using a 6 digit code'

  before do
    set_api_content_type
    SettingsService.new.activate_feature! 'user_confirmation'
  end

  post 'web_api/v1/user/confirm' do
    with_options scope: :confirmation do
      parameter :email, 'The email address of the user to confirm.'
      parameter :code, 'The 4-digit confirmation code received by SMS or email.'
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
      let(:user) { create(:user_with_confirmation) }
      let(:email) { user.email }

      before do
        RequestConfirmationCodeJob.perform_now user
      end

      example 'returns an ok status passing the right code' do
        do_request(confirmation: { email:, code: user.email_confirmation_code })
        assert_status 200
      end

      example "logs 'completed_registration' activity job when passed the right code" do
        do_request(confirmation: { email:, code: user.email_confirmation_code })
        expect(LogActivityJob).to have_been_enqueued.with(
          user,
          'completed_registration',
          user,
          user.updated_at.to_i
        ).exactly(1).times
      end

      example 'returns an auth token when passing the right code' do
        do_request(confirmation: { email:, code: user.email_confirmation_code })
        assert_status 200
        json_response = json_parse response_body
        expect(json_response[:data][:attributes]).to have_key(:auth_token)
        token = json_response[:data][:attributes][:auth_token][:token]
        expect(token[0..2]).to eq 'eyJ' # JWTs start with 'eyJ'
      end

      example 'returns an unprocessable entity status passing no code' do
        do_request(confirmation: { email:, code: nil })
        assert_status 422
      end

      example 'returns an code.blank error code when no code is passed' do
        do_request(confirmation: { email:, code: nil })

        assert_status 422
        json_response = json_parse response_body
        expect(json_response).to include_response_error(:code, 'blank')
      end

      example 'returns an code.invalid error code when the code is invalid' do
        do_request(confirmation: { email:, code: 'badcode' })

        assert_status 422
        json_response = json_parse response_body
        expect(json_response).to include_response_error(:code, 'invalid')
      end

      example "does not log 'completed_registration' activity when the code is invalid" do
        # Clear any previously enqueued jobs
        ActiveJob::Base.queue_adapter.enqueued_jobs.clear

        do_request(confirmation: { email:, code: 'badcode' })

        expect(LogActivityJob).not_to have_been_enqueued.with(
          anything,
          'completed_registration',
          anything,
          anything
        )
      end
    end
  end
end
