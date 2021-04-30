require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Confirmations' do
  explanation 'User can confirm their phones or emails using a 6 digit code'

  before do
    set_api_content_type
    AppConfiguration.instance.activate_feature!('user_confirmation')
  end

  post 'web_api/v1/user/confirm' do
    with_options scope: :confirmation do
      parameter :code, 'The 6-digit confirmation code received by SMS or email.'
    end

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
        UserConfirmation::SendConfirmationCode.call(user: user)
      end

      example 'returns an ok status passing the right code' do
        do_request(confirmation: { code: user.email_confirmation_code })
        expect(status).to eq 200
      end

      example 'returns an unprocessable entity status passing no code' do
        do_request(confirmation: { code: nil })
        expect(status).to eq 422
      end

      example 'returns an code.blank error code when no code is passed' do
        do_request(confirmation: { code: nil })
        expect(response_errors_for(:code, :blank)).to be_present
      end

      example 'returns an unprocessable entity status when the code is invalid' do
        do_request(confirmation: { code: 'badcode' })
        expect(status).to eq 422
      end

      example 'returns an code.invalid error code when the code is invalid' do
        do_request(confirmation: { code: 'badcode' })
        expect(response_errors_for(:code, :invalid)).to be_present
      end
    end
  end
end
