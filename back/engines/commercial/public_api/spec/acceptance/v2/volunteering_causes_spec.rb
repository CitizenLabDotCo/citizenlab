# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require './engines/commercial/public_api/spec/acceptance/v2/support/shared'

resource 'Volunteering' do
  explanation <<~DESC.squish
    Volunteering endpoints provide details about the volunteering causes on the platform
    and users that have signed up as volunteers to those causes.
  DESC

  include_context 'common_auth'

  let!(:volunteering_causes) { create_list(:cause, 5) }

  get '/api/v2/volunteering_causes/' do
    route_summary 'List volunteering causes'
    route_description 'All volunteering causes added to the platform'

    include_context 'common_list_params'

    context 'when the page size is smaller than the total number of volunteering causes' do
      let(:page_size) { 2 }

      example_request 'Successful response' do
        assert_status 200

        expect(json_response_body[:volunteering_causes].size).to eq(page_size)

        total_pages = (volunteering_causes.size.to_f / page_size).ceil
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

  get '/api/v2/volunteering_causes/:id' do
    route_summary 'Get a volunteering cause'
    route_description 'Retrieve a single volunteering cause by its ID.'

    include_context 'common_item_params'

    let(:volunteering_cause) { volunteering_causes[0] }
    let(:id) { volunteering_cause.id }

    example_request 'Returns the volunteering cause in the default locale' do
      assert_status 200
      expect(json_response_body[:volunteering_cause]).to include({ id: id })
      expect(json_response_body.dig(:volunteering_cause, :title))
        .to eq volunteering_cause.title_multiloc['en']
    end

    context 'when the locale is specified' do
      let(:locale) { 'nl-NL' }

      before do
        volunteering_cause.update!(title_multiloc: { 'nl-NL': 'Some dutch' })
      end

      example_request 'Returns the volunteering cause in the specified locale' do
        assert_status 200
        expect(json_response_body.dig(:volunteering_cause, :title))
          .to eq volunteering_cause.title_multiloc['nl-NL']
      end
    end
  end

  include_examples '/api/v2/.../deleted', :volunteering_causes
end
