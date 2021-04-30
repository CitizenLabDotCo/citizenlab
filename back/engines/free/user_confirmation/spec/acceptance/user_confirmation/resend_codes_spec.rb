require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Code Resends' do
  explanation 'A user can ask for a new code and update an email in case a mistake was made before.'

  before do
    set_api_content_type
    AppConfiguration.instance.activate_feature!('user_confirmation')
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
        before do
          do_request(new_email: 'test@test.com')
        end

        example 'returns an ok status when passing a valid email' do
          expect(status).to eq 200
        end

        example 'delivers an email to the user' do
          do_request
          last_email = ActionMailer::Base.deliveries.last
          expect(last_email.to).to eq ['test@test.com']
        end

        example 'delivers an email with the confirmation code' do
          do_request
          last_email = ActionMailer::Base.deliveries.last
          expect(last_email.body.encoded).to include user.reload.email_confirmation_code
        end
      end

      context 'when passing in invalid new email' do
        before do
          do_request(new_email: 'bademail.com')
        end

        example 'returns an unprocessable entity status' do
          expect(status).to eq 422
        end

        example 'returns an code.blank error code when no code is passed' do
          expect(response_errors_for(:email, :invalid)).to be_present
        end
      end

      context 'for a normal request without params' do
        example 'returns an ok status when performing the request without params' do
          do_request
          expect(status).to eq 200
        end

        example 'delivers an email to the user' do
          do_request
          last_email = ActionMailer::Base.deliveries.last
          expect(last_email.to).to eq [user.email]
        end

        example 'delivers an email with the confirmation code' do
          do_request
          last_email = ActionMailer::Base.deliveries.last
          expect(last_email.body.encoded).to include user.reload.email_confirmation_code
        end
      end
    end
  end
end
