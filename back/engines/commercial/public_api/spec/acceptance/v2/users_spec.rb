# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require './engines/commercial/public_api/spec/acceptance/v2/support/shared'

resource 'Users' do
  explanation 'All registrations on the citizenlab platform.'

  include_context 'common_auth'

  let!(:users) { create_list(:user_with_demographics, 5) }

  get '/api/v2/users/' do
    route_summary 'Get a page of users.'
    route_description 'Endpoint to retrieve users of the platform. The most recent users are returned first. The endpoint supports pagination.'

    include_context 'common_list_params'

    # TODO: Filters - first_participated_at, status

    context 'Unfiltered paged request' do
      let(:page_size) { 2 }

      example_request 'Successful response' do
        assert_status 200
        expect(json_response_body[:users].size).to eq 2
        expect(json_response_body[:meta]).to eq({ total_pages: 3, current_page: 1 })
      end
    end

    context 'Filtered by created_at' do
      let(:created_at) { '2022-05-01,2022-05-03' }

      before { users[0].update(created_at: '2022-05-02') }

      example_request 'Successful response', document: false do
        assert_status 200
        expect(json_response_body[:users].size).to eq 1
        expect(json_response_body[:meta]).to eq({ total_pages: 1, current_page: 1 })
      end
    end

    context 'Filtered by updated_at' do
      let(:updated_at) { ',2023-01-31' }

      before { users[0].update(updated_at: '2023-01-01') }

      example_request 'Successful response', document: false do
        assert_status 200
        expect(json_response_body[:users].size).to eq 1
        expect(json_response_body[:meta]).to eq({ total_pages: 1, current_page: 1 })
      end
    end
  end

  get '/api/v2/users/:id' do
    route_summary 'Get a single user by id.'
    route_description 'Endpoint to retrieve a single user of the platform.'

    include_context 'common_item_params'

    let(:id) { users[0].id }

    before { users[0].update(bio_multiloc: { en: 'Yes.', 'fr-BE': 'Oui.', 'nl-BE': 'Ja.' }) }

    context 'Default locale' do
      example_request 'Successful response' do
        assert_status 200
        expect(json_response_body[:user]).to include({ id: id })
      end
    end

    context 'Retrieving a different locale' do
      let(:locale) { 'nl-BE' }

      example_request 'Successful response', document: false do
        assert_status 200
        expect(json_response_body[:user][:bio]).to eq users[0].bio_multiloc['nl-BE']
      end
    end
  end
end
