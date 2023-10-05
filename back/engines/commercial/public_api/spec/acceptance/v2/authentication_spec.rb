# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Authentication' do
  explanation <<~DESC.squish
    To obtain your client_id and client_secret please visit 'Admin > Tools > Public API Access' within your Citizenlab platform.
    If this feature is not enabled on your platform then please contact support@citizenlab.co. 
    Authenticate with your client_id and client_secret to retrieve a JWT token. 
    You need to send the JWT token you got back along with every request to the API, as part of the `Authorization` header. 
    The JWT token expires after 24h, so make sure to re-authenticate.
  DESC

  post '/api/v2/authenticate' do
    route_summary 'Retrieve a JWT token for authentication.'
    route_description 'Endpoint to authenticate using client_id and client_secret to retrieve a JWT token.'

    before do
      header 'Content-Type', 'application/json'
      @api_token = PublicApi::ApiClient.create
    end

    parameter :client_id, 'The client ID you obtained to access this API', required: true, type: 'string', scope: 'auth'
    parameter :client_secret, 'The client secret you obtained to access this API', required: true, type: 'string', scope: 'auth'

    let(:client_id) { @api_token.id }
    let(:client_secret) { @api_token.secret }

    example_request 'Successful authentication' do
      assert_status 201
      expect(json_response_body[:jwt]).to be_present
    end

    # TODO: Do 404 response
  end
end
