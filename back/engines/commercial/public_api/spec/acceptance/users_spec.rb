# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require './engines/commercial/public_api/spec/acceptance/support/shared'

resource 'Users' do
  before do
    create_list(:user_with_demographics, 5)
    api_token = PublicApi::ApiClient.create
    token = Knock::AuthToken.new(payload: api_token.to_token_payload).token
    header 'Authorization', "Bearer #{token}"
  end

  explanation 'All registrations on the citizenlab platform.'

  include_context 'common_parameters'

  get '/api/v1/:locale/users/' do
    route_summary 'Get a page of users.'
    route_description 'Endpoint to retrieve users of the platform. The most recent users are returned first. The endpoint supports pagination.'

    let(:locale) { 'en' }
    let(:page_size) { 2 }

    example_request 'Successful response' do
      assert_status 200
      expect(json_response_body[:users].size).to eq 2
      expect(json_response_body[:meta]).to eq({ total_pages: 3, current_page: 1 })
    end
  end
end
