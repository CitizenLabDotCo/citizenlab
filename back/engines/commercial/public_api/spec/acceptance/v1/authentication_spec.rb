# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Authentication' do
  before do
    header 'Content-Type', 'application/json'
  end

  explanation 'Contact support@citizenlab.co to get hold of your client_id and client_secret. Authenticate with your client_id and client_secret to retrieve a JWT token. You need to send the JWT token you got back along with every request to the API, as part of the `Authorization` header. The JWT token expires after 24h, so make sure to re-authenticate.'

  route '/api/v1/authenticate', 'Authentication' do
    post 'Authenticate' do
      before do
        @api_token = PublicApi::ApiClient.create
      end

      with_options scope: :auth do
        attribute :client_id, 'The client ID you obtained to access this API', required: true, type: 'string', scope: 'auth'
        attribute :client_secret, 'The client secret you obtained to access this API', required: true, type: 'string', scope: 'auth'
      end

      let(:client_id) { @api_token.id }
      let(:client_secret) { @api_token.secret }

      example 'Authentication example' do
        do_request(auth: {
          client_id: client_id,
          client_secret: @api_token.secret
        })
        expect(status).to eq 201
        json_response = json_parse(response_body)
        expect(json_response[:jwt]).to be_present
      end
    end
  end
end
