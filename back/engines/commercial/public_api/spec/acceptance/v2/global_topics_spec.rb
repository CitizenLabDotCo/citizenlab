# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require './engines/commercial/public_api/spec/acceptance/v2/support/shared'

resource 'Global Topics' do
  explanation <<~DESC.squish
    Global topics are platform-wide topics used to categorize projects and pages.
    Unlike input topics which are project-specific, global topics exist at the platform level
    and can be associated with multiple projects and static pages.
  DESC

  include_context 'common_auth'

  let!(:global_topics) { create_list(:global_topic, 5) }

  get '/api/v2/global_topics/' do
    route_summary 'List global topics'
    route_description <<~DESC.squish
      Retrieve a paginated list of all global topics on the platform, with the most recently
      created ones first.
    DESC

    include_context 'common_list_params'

    context 'when the page size is smaller than the total number of global topics' do
      let(:page_size) { 2 }

      example_request 'Successful response' do
        assert_status 200
        expect(json_response_body[:global_topics].size).to eq(page_size)

        total_pages = (global_topics.size.to_f / page_size).ceil
        expect(json_response_body[:meta]).to eq({ total_pages: total_pages, current_page: 1 })
      end
    end

    include_examples 'filtering_by_date', :global_topic, :created_at

    # Temporarily disable acts_as_list callbacks because they modify the updated_at
    # attribute and break the tests. We use `it_behaves_like` to include the tests
    # in a nested context to limit the scope of the `around` block.
    it_behaves_like 'filtering_by_date', :global_topic, :updated_at do
      around do |example|
        GlobalTopic.acts_as_list_no_update { example.run }
      end
    end
  end

  get '/api/v2/global_topics/:id' do
    route_summary 'Get global topic'
    route_description 'Retrieve a single global topic by its ID.'

    include_context 'common_item_params'

    let(:global_topic) { global_topics[0] }
    let(:id) { global_topic.id }

    before do
      # NOTE: Temp fix until locales of factories and tenants are consistent
      # Currently, the tenant locales are ["en", "fr-FR", "nl-NL"], while the factory
      # locales are ["en", "nl-BE"]. The following code aligns the two by replacing
      # the "nl-BE" locale with "nl-NL" in the global topic.
      title = global_topic[:title_multiloc]
      title['nl-NL'] = title.delete 'nl-BE'
      global_topic.update!(title_multiloc: title)
    end

    example_request 'Returns the global topic in the default locale' do
      assert_status 200
      expect(json_response_body[:global_topic]).to include({ id: id })
    end

    context 'when the locale is specified' do
      let(:locale) { 'nl-NL' }

      example_request 'Returns the global topic in the specified locale' do
        assert_status 200
        expect(json_response_body.dig(:global_topic, :title))
          .to eq global_topic.title_multiloc['nl-NL']
      end
    end
  end

  include_examples '/api/v2/.../deleted', :global_topics, item_type: 'GlobalTopic'
end
