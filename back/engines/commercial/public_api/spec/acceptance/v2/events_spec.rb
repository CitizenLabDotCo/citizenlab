# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require './engines/commercial/public_api/spec/acceptance/v2/support/shared'

resource 'Events' do
  explanation <<~DESC.squish
    Events can be created in projects and residents can sign up to attend events (event_attendances).
  DESC

  include_context 'common_auth'

  let!(:events) { create_list(:event, 5) }

  get '/api/v2/events' do
    route_summary 'List all events'
    route_description 'List all events created on the platform.'

    include_context 'common_list_params'

    context 'when the page size is smaller than the total number of events' do
      let(:page_size) { 2 }

      example_request 'Successful response' do
        assert_status 200

        expect(json_response_body[:events].size).to eq(page_size)
        expect(json_response_body[:events].first.keys).to match_array(%i[id project_id title title_multiloc description description_multiloc location location_multiloc location_point attendees_count maximum_attendees start_at end_at created_at updated_at])

        total_pages = (events.size.to_f / page_size).ceil
        expect(json_response_body[:meta]).to eq({ total_pages: total_pages, current_page: 1 })
      end
    end

    include_examples 'filtering_by_date', :event, :created_at
    include_examples 'filtering_by_date', :event, :updated_at
  end

  get '/api/v2/events/:id' do
    route_summary 'Get a single event'
    route_description 'Retrieve a single event by its ID.'

    include_context 'common_item_params'

    let(:id) { events.first.id }

    example_request 'Returns the event' do
      assert_status 200
      expect(json_response_body[:event]).to include({ id: id })
    end
  end

  include_examples '/api/v2/.../deleted', :events
end
