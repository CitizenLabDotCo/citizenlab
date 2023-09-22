# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require './engines/commercial/public_api/spec/acceptance/v2/support/shared'

resource 'Events' do
  include_context 'common_auth'

  let!(:event_attendances) { create_list(:event_attendance, 5) }

  get '/api/v2/event_attendances/' do
    route_summary 'List attendees of events'
    route_description 'All users signed up to attend events.'

    include_context 'common_list_params'

    context 'when the page size is smaller than the total number of volunteers' do
      let(:page_size) { 2 }

      example_request 'Successful response' do
        assert_status 200

        expect(json_response_body[:event_attendances].size).to eq(page_size)
        expect(json_response_body[:event_attendances].first.keys).to match_array(%i[id event_id attendee_id created_at updated_at])

        total_pages = (event_attendances.size.to_f / page_size).ceil
        expect(json_response_body[:meta]).to eq({ total_pages: total_pages, current_page: 1 })
      end
    end

    # include_examples 'filtering_by_date', :email_campaign, :created_at
    #
    # # Temporarily disable acts_as_list callbacks because they modify the updated_at
    # # attribute and break the tests. We use `it_behaves_like` to include the tests
    # # in a nested context to limit the scope of the `around` block.
    # it_behaves_like 'filtering_by_date', :email_campaign, :updated_at do
    #   around do |example|
    #     EmailCampaigns::Campaign.acts_as_list_no_update { example.run }
    #   end
    # end
  end

  get '/api/v2/event_attendances/:id' do
    route_summary 'Get an attendee'
    route_description 'Retrieve a single event attendee by their ID.'

    include_context 'common_item_params'

    let(:id) { event_attendances.first.id }

    example_request 'Returns the attendee' do
      assert_status 200
      expect(json_response_body[:event_attendance]).to include({ id: id })
    end
  end

  include_examples '/api/v2/.../deleted', :event_attendances
end
