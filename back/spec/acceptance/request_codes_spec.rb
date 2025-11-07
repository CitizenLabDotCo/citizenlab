# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Request codes' do
  before do
    set_api_content_type
    SettingsService.new.activate_feature! 'user_confirmation'
  end

  post 'web_api/v1/user/request_code_unauthenticated' do
    with_options scope: :request_code do
      parameter :email, 'The email of the user requesting a confirmation code.', required: true
    end

    before do
      allow(RequestConfirmationCodeJob).to receive(:perform_now)
    end

    example 'It works with a passwordless user' do
      user = create(:user_no_password)
      do_request(request_code: { email: user.email })
      expect(RequestConfirmationCodeJob).to have_received(:perform_now).with(user).once
    end

    example 'It does not work with a user with password' do
      user = create(:user)
      do_request(request_code: { email: user.email })
      expect(RequestConfirmationCodeJob).not_to have_received(:perform_now)
    end

    example 'It does not work if user reached email_confirmation_code_reset_count' do
      user = create(:user_no_password, email_confirmation_code_reset_count: 5)
      do_request(request_code: { email: user.email })
      expect(RequestConfirmationCodeJob).not_to have_received(:perform_now)
    end
  end
end

# resource 'Code Resends' do
#   explanation 'A user can ask for a new code and update an email in case a mistake was made before.'

#   before do
#     set_api_content_type
#     SettingsService.new.activate_feature! 'user_confirmation'
#   end

#   post 'web_api/v1/user/resend_code' do
#     parameter :new_email, '[Optional] A new email to resend the code to.'

#     context 'when not logged in' do
#       example 'returns a not authorized status passing a valid code' do
#         do_request(confirmation: { code: '1234' })
#         expect(status).to eq 401
#       end
#     end

#     context 'when logged in' do
#       let(:user) { create(:user_with_confirmation) }

#       before do
#         header_token_for(user)
#       end

#       context 'when passing a valid new email' do
#         let(:success) { double }

#         before do
#           allow(RequestConfirmationCodeJob).to receive(:perform_now)
#           do_request(new_email: 'test@test.com')
#         end

#         example 'returns an ok status when passing a valid email' do
#           assert_status 200
#           expect(RequestConfirmationCodeJob).to have_received(:perform_now).with(user, new_email: 'test@test.com').once
#         end
#       end

#       context 'when passing in invalid new email' do
#         before do
#           do_request(new_email: 'bademail.com')
#         end

#         example 'returns an code.blank error code when no code is passed' do
#           assert_status 422
#           json_response = json_parse response_body
#           expect(json_response).to include_response_error(:email, 'invalid')
#         end
#       end

#       context 'for a normal request without params' do
#         let(:success) { double }

#         example 'returns an ok status when performing the request without params' do
#           allow(RequestConfirmationCodeJob).to receive(:perform_now)

#           do_request
#           assert_status 200
#           expect(RequestConfirmationCodeJob).to have_received(:perform_now).with(user, new_email: nil).once
#         end
#       end

#       example 'requesting a code more than 5 times' do
#         user.update(email_confirmation_code_reset_count: 5)
#         do_request
#         assert_status 422
#       end

#       example 'requesting a code more than 5 times but always providing new email' do
#         user.update(email_confirmation_code_reset_count: 5)
#         do_request(new_email: 'some@email.com')
#         assert_status 200
#         # A bit weird, but if a `new_email` is provided, the limit is not applied.
#         # But at least this does not allow people to brute force the code,
#         # since the email_confirmation_retry_count is not reset in this case.
#         # (see test below)
#       end

#       example 'request a code with a new email does NOT reset the email_confirmation_retry_count' do
#         user.update(email_confirmation_retry_count: 3)
#         user.update(email_confirmation_code_reset_count: 3)

#         do_request(new_email: 'test@email.com')
#         assert_status 200

#         user.reload
#         expect(user.email_confirmation_retry_count).to eq 3
#         expect(user.email_confirmation_code_reset_count).to eq 1
#       end
#     end
#   end

#   post 'web_api/v1/user/resend_code_unauthenticated' do
#     parameter :email, 'The email address of the user requesting a new confirmation code.'

#     before do
#       @user = create(:user_with_confirmation, email: 'test@test.com')
#     end

#     example 'resending a confirmation code to an existing user email' do
#       allow(RequestConfirmationCodeJob).to receive(:perform_now)
#       do_request(email: @user.email)
#       expect(status).to eq 200
#       expect(RequestConfirmationCodeJob).to have_received(:perform_now).with(@user, new_email: nil).once
#     end

#     example 'resending a confirmation code to a non-existing user email' do
#       do_request(email: 'wrong@email.com')
#       expect(status).to eq 404
#     end

#     example 'increments the email_confirmation_code_reset_count on the user' do
#       expect do
#         do_request(email: @user.email)
#       end.to change { @user.reload.email_confirmation_code_reset_count }.by(1)
#     end
#   end
# end
