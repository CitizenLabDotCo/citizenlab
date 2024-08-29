# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require './engines/commercial/public_api/spec/acceptance/v2/support/shared'

resource 'Volunteering' do
  include_context 'common_auth'

  let!(:volunteers) { create_list(:volunteer, 5) }

  get '/api/v2/volunteering_volunteers/' do
    route_summary 'List volunteers'
    route_description 'All users signed up as volunteers against causes.'

    include_context 'common_list_params'

    context 'when the page size is smaller than the total number of volunteers' do
      let(:page_size) { 2 }

      example_request 'Successful response' do
        assert_status 200

        expect(json_response_body[:volunteering_volunteers].size).to eq(page_size)

        total_pages = (volunteers.size.to_f / page_size).ceil
        expect(json_response_body[:meta]).to eq({ total_pages: total_pages, current_page: 1 })
      end
    end

    include_examples 'filtering_by_date', :volunteer, :created_at, 'volunteering_volunteer'
    include_examples 'filtering_by_date', :volunteer, :updated_at, 'volunteering_volunteer'
  end

  get '/api/v2/volunteering_volunteers/:id' do
    route_summary 'Get a volunteer'
    route_description 'Retrieve a single volunteer by its ID.'

    include_context 'common_item_params'

    let(:volunteer) { volunteers.first }
    let(:id) { volunteer.id }

    example_request 'Returns the volunteer' do
      assert_status 200
      expect(json_response_body[:volunteering_volunteer]).to include({ id: id })
    end
  end

  include_examples '/api/v2/.../deleted', :volunteering_volunteers
end
