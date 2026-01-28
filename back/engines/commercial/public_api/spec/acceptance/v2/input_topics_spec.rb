# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require './engines/commercial/public_api/spec/acceptance/v2/support/shared'

resource 'Input Topics' do
  explanation <<~DESC.squish
    Input topics are project-level topics used to categorize ideas and other inputs within a project.
    Unlike global topics which are platform-wide, input topics are specific to a project and can be
    managed independently.
  DESC

  include_context 'common_auth'

  let!(:project) { create(:project) }
  let!(:input_topics) { create_list(:input_topic, 5, project: project) }

  get '/api/v2/input_topics/' do
    route_summary 'List input topics'
    route_description <<~DESC.squish
      Retrieve a paginated list of all input topics across all projects, with the most recently
      created ones first.
    DESC

    include_context 'common_list_params'

    context 'when the page size is smaller than the total number of input topics' do
      let(:page_size) { 2 }

      example_request 'Successful response' do
        assert_status 200
        expect(json_response_body[:input_topics].size).to eq(page_size)

        total_pages = (input_topics.size.to_f / page_size).ceil
        expect(json_response_body[:meta]).to eq({ total_pages: total_pages, current_page: 1 })
      end
    end

    include_examples 'filtering_by_date', :input_topic, :created_at

    # Temporarily disable acts_as_list callbacks because they modify the updated_at
    # attribute and break the tests. We use `it_behaves_like` to include the tests
    # in a nested context to limit the scope of the `around` block.
    it_behaves_like 'filtering_by_date', :input_topic, :updated_at
  end

  get '/api/v2/input_topics/:id' do
    route_summary 'Get input topic'
    route_description 'Retrieve a single input topic by its ID.'

    include_context 'common_item_params'

    let(:input_topic) { input_topics[0] }
    let(:id) { input_topic.id }

    before do
      # NOTE: Temp fix until locales of factories and tenants are consistent
      # Currently, the tenant locales are ["en", "fr-FR", "nl-NL"], while the factory
      # locales are ["en", "nl-BE"]. The following code aligns the two by replacing
      # the "nl-BE" locale with "nl-NL" in the input topic.
      title = input_topic[:title_multiloc]
      title['nl-NL'] = title.delete 'nl-BE'
      input_topic.update!(title_multiloc: title)
    end

    example_request 'Returns the input topic in the default locale' do
      assert_status 200
      expect(json_response_body[:input_topic]).to include({ id: id, project_id: project.id })
    end

    context 'when the locale is specified' do
      let(:locale) { 'nl-NL' }

      example_request 'Returns the input topic in the specified locale' do
        assert_status 200
        expect(json_response_body.dig(:input_topic, :title))
          .to eq input_topic.title_multiloc['nl-NL']
      end
    end
  end

  include_examples '/api/v2/.../deleted', :input_topics, item_type: 'InputTopic'
end
