# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require './engines/commercial/public_api/spec/acceptance/v2/support/shared'

resource 'Topics' do
  explanation <<~DESC.squish
    Topics, referred to as tags within the platform, are utilized to label the content on
    the platform, including project, contributions, and pages.
  DESC

  include_context 'common_auth'

  let!(:topics) { create_list(:topic, 5) }

  get '/api/v2/topics/' do
    route_summary 'List topics'
    route_description <<~DESC.squish
      Retrieve a paginated list of all the topics in the platform, with the most recently
      created ones first.
    DESC

    include_context 'common_list_params'

    context 'when the page size is smaller than the total number of topics' do
      let(:page_size) { 2 }

      example_request 'Successful response' do
        assert_status 200
        expect(json_response_body[:topics].size).to eq(page_size)

        total_pages = (topics.size.to_f / page_size).ceil
        expect(json_response_body[:meta]).to eq({ total_pages: total_pages, current_page: 1 })
      end
    end

    include_examples 'filtering_by_date', :topic, :created_at

    # Temporarily disable acts_as_list callbacks because they modify the updated_at
    # attribute and break the tests. We use `it_behaves_like` to include the tests
    # in a nested context to limit the scope of the `around` block.
    it_behaves_like 'filtering_by_date', :topic, :updated_at do
      around do |example|
        Topic.acts_as_list_no_update { example.run }
      end
    end
  end

  get '/api/v2/topics/:id' do
    route_summary 'Get topic'
    route_description 'Retrieve a single topic by its ID.'

    include_context 'common_item_params'

    let(:topic) { topics[0] }
    let(:id) { topic.id }

    before do
      # NOTE: Temp fix until locales of factories and tenants are consistent
      # Currently, the tenant locales are ["en", "fr-FR", "nl-NL"], while the factory
      # locales are ["en", "nl-BE"]. The following code aligns the two by replacing
      # the "nl-BE" locale with "nl-NL" in the topic.
      title = topic[:title_multiloc]
      title['nl-NL'] = title.delete 'nl-BE'
      topic.update!(title_multiloc: title)
    end

    example_request 'Returns the topic in the default locale' do
      assert_status 200
      # TODO: Add test condition to be sure this is the default locale
      expect(json_response_body[:topic]).to include({ id: id })
    end

    context 'when the locale is specified' do
      let(:locale) { 'nl-NL' }

      example_request 'Returns the topic in the specified locale' do
        assert_status 200
        expect(json_response_body.dig(:topic, :title))
          .to eq topic.title_multiloc['nl-NL']
      end
    end
  end

  include_examples '/api/v2/.../deleted', :topics
end
