# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Omniauth Callback', document: false do
  before { header 'Content-Type', 'application/json' }

  post '/auth/failure' do
    example_request 'Redirect to failure URL' do
      expect(status).to eq(302)
      expect(response_headers['Location']).to include('/authentication-error')
    end
  end

  context 'when the user is logged in' do
    before do
      @user = create(:user)
    end

    parameter :user_id, 'User ID', required: true

    let(:user_id) { @user.id }

    get '/auth/clave_unica/logout_data' do
      example_request 'Returns ClaveUnica redirect URL' do
        expect(status).to eq(200)
        expect(json_response_body[:url]).to start_with('https://accounts.claveunica.gob.cl/api/v1/accounts/app/logout')
      end
    end
  end
end
