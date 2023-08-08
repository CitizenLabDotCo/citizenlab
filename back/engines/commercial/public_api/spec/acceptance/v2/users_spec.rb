# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require './engines/commercial/public_api/spec/acceptance/v2/support/shared'

resource 'Users' do
  explanation 'All user registrations on the platform.'

  include_context 'common_auth'

  let!(:users) { create_list(:user_with_demographics, 5) }

  get '/api/v2/users/' do
    route_summary 'List users'
    route_description <<~DESC.squish
      Retrieve a paginated list of all the users in the platform, with the most recently
      created ones first.
    DESC

    include_context 'common_list_params'

    # TODO: Filters - first_participated_at, status

    context 'when the page size is smaller than the total number of users' do
      let(:page_size) { 2 }

      example_request 'List only the first page of users' do
        assert_status 200
        expect(json_response_body[:users].size).to eq(page_size)

        total_pages = (users.size.to_f / page_size).ceil
        expect(json_response_body[:meta]).to eq({ total_pages: total_pages, current_page: 1 })
      end
    end

    include_examples 'filtering_by_date', :user, :created_at
    include_examples 'filtering_by_date', :user, :updated_at
  end

  get '/api/v2/users/:id' do
    route_summary 'Get user'
    route_description 'Retrieve a single user by its ID.'

    include_context 'common_item_params'

    let(:user) { users[0] }
    let(:id) { user.id }

    before { user.update(bio_multiloc: { en: 'Yes.', 'fr-FR': 'Oui.', 'nl-NL': 'Ja.' }) }

    example_request 'Returns the user in the default locale' do
      assert_status 200
      expect(json_response_body[:user]).to include({ id: id })
    end

    context 'when the locale is specified' do
      let(:locale) { 'nl-NL' }

      example_request 'Returns the user in the specified locale', document: false do
        assert_status 200
        expect(json_response_body.dig(:user, :bio))
          .to eq user.bio_multiloc['nl-NL']
      end
    end
  end

  include_examples '/api/v2/.../deleted', :users
end
