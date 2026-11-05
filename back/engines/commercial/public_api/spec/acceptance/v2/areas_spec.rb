# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require './engines/commercial/public_api/spec/acceptance/v2/support/shared'

resource 'Areas' do
  explanation <<~DESC.squish
    Areas are geogprahical regions that can be used to categorize projects, and annotate users.
  DESC

  include_context 'common_auth'

  let!(:areas) { create_list(:area, 5) }

  get '/api/v2/areas/' do
    route_summary 'List areas'
    route_description <<~DESC.squish
      Retrieve a paginated list of all the areas in the platform, with the most recently
      created ones first.
    DESC

    include_context 'common_list_params'

    context 'when the page size is smaller than the total number of areas' do
      let(:page_size) { 2 }

      example_request 'Successful response' do
        assert_status 200
        expect(json_response_body[:areas].size).to eq(page_size)

        total_pages = (areas.size.to_f / page_size).ceil
        expect(json_response_body[:meta]).to eq({ total_pages: total_pages, current_page: 1 })
      end
    end

    # No special reason this test in this spec, but any Public API acceptance test seems good enough.
    context 'logging' do
      example 'logs tenant and api_client information' do
        # Subscribe to rails instrumentation to capture the payload
        payload_data = nil
        subscriber = ActiveSupport::Notifications.subscribe('process_action.action_controller') do |_name, _start, _finish, _id, payload|
          payload_data = payload if payload[:controller] == 'PublicApi::V2::AreasController'
        end

        do_request

        ActiveSupport::Notifications.unsubscribe(subscriber)

        expect(payload_data).not_to be_nil
        expect(payload_data[:tenant_id]).to eq(Tenant.current.id)
        expect(payload_data[:tenant_host]).to eq(Tenant.current.host)
        expect(payload_data[:api_client_id]).to be_present
      end
    end

    include_examples 'filtering_by_date', :area, :created_at

    # Temporarily disable acts_as_list callbacks because they modify the updated_at
    # attribute and break the tests. We use `it_behaves_like` to include the tests
    # in a nested context to limit the scope of the `around` block.
    it_behaves_like 'filtering_by_date', :area, :updated_at do
      around do |example|
        Area.acts_as_list_no_update { example.run }
      end
    end
  end

  get '/api/v2/areas/:id' do
    route_summary 'Get area'
    route_description 'Retrieve a single area by its ID.'

    include_context 'common_item_params'

    let(:area) { areas[0] }
    let(:id) { area.id }

    before do
      # NOTE: Temp fix until locales of factories and tenants are consistent
      # Currently, the tenant locales are ["en", "fr-FR", "nl-NL"], while the factory
      # locales are ["en", "nl-BE"]. The following code aligns the two by replacing
      # the "nl-BE" locale with "nl-NL" in the area.
      title = area[:title_multiloc]
      title['nl-NL'] = title.delete 'nl-BE'
      area.update!(title_multiloc: title)
    end

    example_request 'Returns the area in the default locale' do
      assert_status 200
      # TODO: Add test condition to be sure this is the default locale
      expect(json_response_body[:area]).to include({ id: id })
    end

    context 'when the locale is specified' do
      let(:locale) { 'nl-NL' }

      example_request 'Returns the area in the specified locale' do
        assert_status 200
        expect(json_response_body.dig(:area, :title))
          .to eq area.title_multiloc['nl-NL']
      end
    end
  end

  include_examples '/api/v2/.../deleted', :areas
end
