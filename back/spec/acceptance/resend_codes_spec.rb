# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Code Resends' do
  explanation 'A user can ask for a new code and update an email in case a mistake was made before.'

  before do
    set_api_content_type
    SettingsService.new.activate_feature! 'user_confirmation'
  end

  post 'web_api/v1/user/resend_code' do
    parameter :new_email, '[Optional] A new email to resend the code to.'

    context 'when not logged in' do
      example 'returns a not authorized status passing a valid code' do
        do_request(confirmation: { code: '1234' })
        expect(status).to eq 401
      end
    end

    context 'when logged in' do
      let(:user) { create(:user_with_confirmation) }

      before do
        header_token_for(user)
      end

      context 'when passing a valid new email' do
        let(:success) { double }

        before do
          allow(SendConfirmationCode).to receive(:call).and_return(success)
          allow(success).to receive(:success?).and_return(true)
          do_request(new_email: 'test@test.com')
        end

        example 'returns an ok status when passing a valid email' do
          assert_status 200
          expect(SendConfirmationCode).to have_received(:call).with(user: user, new_email: 'test@test.com').once
        end
      end

      context 'when passing in invalid new email' do
        before do
          do_request(new_email: 'bademail.com')
        end

        example 'returns an unprocessable entity status' do
          assert_status 422
        end

        example 'returns an code.blank error code when no code is passed' do
          assert_status 422
          json_response = json_parse response_body
          expect(json_response).to include_response_error(:email, 'invalid')
        end
      end

      context 'for a normal request without params' do
        let(:success) { double }

        example 'returns an ok status when performing the request without params' do
          allow(SendConfirmationCode).to receive(:call).and_return(success)
          allow(success).to receive(:success?).and_return(true)

          do_request
          assert_status 200
          expect(SendConfirmationCode).to have_received(:call).with(user: user, new_email: nil).once
        end
      end
    end
  end
end
