require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Authentication" do

  before do
    header "Content-Type", "application/json"
  end

  explanation "Authenticate with your `client_id` and `client_password` to retrieve a JWT token. You will need to send the JWT token you got back along with every request to the API, as part of the `Authorization` header. The JWT token expires after 24h, so make sure to re-authenticate."

  route "public_api/v1/authenticate", "Authentication" do

    post "public_api/v1/authenticate" do

      before do
        @api_token = PublicApi::ApiClient.create
      end

      # with_options scope: :auth do
        # parameter :client_id, "The client ID you obtained to access this API", required: true, type: 'string', scope: 'auth'
        attribute :client_secret, "The client secret you obtained to access this API", required: true, type: 'string', scope: 'auth'
      # end

      let(:client_id) { @api_token.id }
      let(:client_secret) { @api_token.secret }

      example_request "Authentication example" do
        # expect(status).to eq 201
        # json_response = json_parse(response_body)
        # expect(json_response[:jwt]).to be_present
      end

    end

  end
end