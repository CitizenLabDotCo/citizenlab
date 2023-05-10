# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require './engines/commercial/public_api/spec/acceptance/support/shared'

resource 'Users' do
  explanation 'All registrations on the citizenlab platform.'

  include_context 'common_auth'

  let!(:users) { create_list(:user_with_demographics, 5) }

  get '/api/v1/:locale/users/' do
    route_summary 'Get a page of users.'
    route_description 'Endpoint to retrieve users of the platform. The most recent users are returned first. The endpoint supports pagination.'

    include_context 'common_list_params'

    let(:locale) { 'en' }
    let(:page_size) { 2 }

    example_request 'Successful response' do
      assert_status 200
      expect(json_response_body[:users].size).to eq 2
      expect(json_response_body[:meta]).to eq({ total_pages: 3, current_page: 1 })
    end
  end

  get '/api/v1/:locale/users/:id' do
    route_summary 'Get a single user by id.'
    route_description 'Endpoint to retrieve a single user of the platform.'

    include_context 'common_item_params'

    let(:locale) { 'en' }
    let(:id) { users[0].id }

    example_request 'Successful response' do
      assert_status 200
      pp json_response_body
      expect(json_response_body[:user]).to include({ id: id })
    end
  end
end
