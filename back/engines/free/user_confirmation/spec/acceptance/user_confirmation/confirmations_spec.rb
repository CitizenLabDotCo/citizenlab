require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Confirmations' do
  explanation 'User can confirm their phones or emails using a 6 digit code'

  before do
    set_api_content_type
  end

  post 'web_api/v1/user/confirm' do
    parameter :code, 'The 6-digit confirmation code received by SMS or email.'

    context 'when not logged in' do
      example_request 'passing a valid code' do
        let(:code) { '123456' }

        it 'returns a not authorized status' do
          expect(status).to eq 401
        end
      end
    end

    context 'when logged in' do
      let(:user) { create(:user) }

      before do
        header_token_for(user)
        do_request
      end

      example 'passing the right code' do
        let(:code) { user.confirmation_code }

        it 'returns an ok status' do
          expect(status).to eq 200
        end
      end

      example 'passing no code' do
        it 'returns an unprocessable entity status' do
          expect(status).to eq 422
        end

        it 'returns an code.blank error code' do
          expect(response_error).to eq 'code.blank'
        end
      end

      example 'passing an invalid code' do
        let(:code) { 'badcode' }

        it 'returns an unprocessable entity status' do
          expect(status).to eq 422
        end

        it 'returns an code.blank error code' do
          expect(response_error).to eq 'code.invalid'
        end
      end
    end
  end
end
