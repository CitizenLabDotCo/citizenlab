# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require './engines/commercial/public_api/spec/acceptance/v2/support/shared'

resource 'Topics' do
  explanation <<~DESC.squish
    [deprecated] Topics, referred to as tags within the platform, are utilized to label the content on
    the platform, including projects, contributions, and pages. This endpoint is deprecated and
    will be removed in future versions. Please use `/api/v2/global_topics` for platform-wide topics
    or `/api/v2/input_topics` for project-specific input topics instead.
  DESC

  include_context 'common_auth'

  let!(:project) { create(:project) }
  let!(:global_topics) { create_list(:global_topic, 3) }
  let!(:input_topics) { create_list(:input_topic, 2, project: project) }

  get '/api/v2/topics/' do
    route_summary '[deprecated] List topics'
    route_description <<~DESC.squish
      Retrieve a paginated list of all topics (both global topics and input topics merged together)
      in the platform, with the most recently created ones first.

      This endpoint is deprecated and will be removed in future versions. Please use
      `/api/v2/global_topics` or `/api/v2/input_topics` instead.
    DESC

    include_context 'common_list_params'

    context 'when listing all topics' do
      example_request 'Returns merged global and input topics' do
        assert_status 200
        total_count = global_topics.size + input_topics.size
        expect(json_response_body[:topics].size).to eq(total_count)

        all_ids = global_topics.pluck(:id) + input_topics.pluck(:id)
        returned_ids = json_response_body[:topics].pluck(:id)
        expect(returned_ids).to match_array(all_ids)
      end
    end

    context 'when the page size is smaller than the total number of topics' do
      let(:page_size) { 2 }

      example_request 'Successful response with pagination' do
        assert_status 200
        expect(json_response_body[:topics].size).to eq(page_size)

        total_count = global_topics.size + input_topics.size
        total_pages = (total_count.to_f / page_size).ceil
        expect(json_response_body[:meta]).to eq({ total_pages: total_pages, current_page: 1 })
      end
    end

    context 'when filtering by created_at' do
      let!(:old_global_topic) { create(:global_topic, created_at: '2020-01-01') }
      let!(:old_input_topic) { create(:input_topic, project: project, created_at: '2020-01-01') }
      let!(:recent_global_topic) { create(:global_topic, created_at: '2020-01-15') }
      let!(:recent_input_topic) { create(:input_topic, project: project, created_at: '2020-01-15') }
      let(:created_at) { '2020-01-10,2020-01-20' }

      example_request 'Filters both global and input topics by created_at' do
        assert_status 200
        returned_ids = json_response_body[:topics].pluck(:id)

        # Old topics should be filtered out
        expect(returned_ids).not_to include(old_global_topic.id)
        expect(returned_ids).not_to include(old_input_topic.id)

        # Recent topics within the date range should be included
        expect(returned_ids).to include(recent_global_topic.id)
        expect(returned_ids).to include(recent_input_topic.id)
      end
    end
  end

  get '/api/v2/topics/:id' do
    route_summary '[deprecated] Get topic'
    route_description <<~DESC.squish
      Retrieve a single topic by its ID. Works for both global topics and input topics.

      This endpoint is deprecated and will be removed in future versions. Please use
      `/api/v2/global_topics/:id` or `/api/v2/input_topics/:id` instead.
    DESC

    include_context 'common_item_params'

    context 'when requesting a global topic' do
      let(:topic) { global_topics[0] }
      let(:id) { topic.id }

      before do
        title = topic[:title_multiloc]
        title['nl-NL'] = title.delete 'nl-BE'
        topic.update!(title_multiloc: title)
      end

      example_request 'Returns the global topic' do
        assert_status 200
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

    context 'when requesting an input topic' do
      let(:topic) { input_topics[0] }
      let(:id) { topic.id }

      before do
        title = topic[:title_multiloc]
        title['nl-NL'] = title.delete 'nl-BE'
        topic.update!(title_multiloc: title)
      end

      example_request 'Returns the input topic' do
        assert_status 200
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
  end

  get '/api/v2/topics/deleted' do
    route_summary '[deprecated] List deleted topics'
    route_description <<~DESC.squish
      Retrieve a list of deleted topics. Includes both global topics and input topics.

      This endpoint is deprecated and will be removed in future versions. Please use
      `/api/v2/global_topics/deleted` or `/api/v2/input_topics/deleted` instead.
    DESC

    parameter(
      :deleted_at,
      'Date item was deleted - in format "YYYY-DD-MM" - to filter between two dates separate with comma',
      in: :query,
      required: false,
      type: 'string'
    )

    let!(:deleted_global_topic) do
      create(:activity, item_type: 'GlobalTopic', action: 'deleted', acted_at: '2020-01-01')
    end

    let!(:deleted_input_topic) do
      create(:activity, item_type: 'InputTopic', action: 'deleted', acted_at: '2020-01-02')
    end

    # Legacy Topic deletion activity (for backwards compatibility)
    let!(:deleted_legacy_topic) do
      create(:activity, item_type: 'Topic', action: 'deleted', acted_at: '2020-01-03')
    end

    example_request 'List deleted topics from all types' do
      assert_status 200

      expected_items = [deleted_global_topic, deleted_input_topic, deleted_legacy_topic].map do |activity|
        {
          id: activity.item_id,
          type: activity.item_type,
          deleted_at: activity.acted_at.iso8601(3)
        }
      end

      expect(json_response_body[:deleted_items]).to match_array(expected_items)
    end

    context "when filtering by 'deleted_at'" do
      let(:deleted_at) { '2020-01-02,2020-01-31' }

      example_request 'List only topics deleted during the specified period' do
        assert_status 200
        # Should include both the input topic (Jan 2) and legacy topic (Jan 3)
        expect(json_response_body[:deleted_items].size).to eq(2)
      end
    end
  end
end
