# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require './engines/commercial/public_api/spec/acceptance/v2/support/shared'

resource 'Topics' do
  include_context 'common_auth'

  parameter(
    :idea_id,
    'Filter by idea ID',
    required: false,
    type: :string,
    in: :query
  )

  parameter(
    :topic_id,
    'Filter by topic ID',
    required: false,
    type: :string,
    in: :query
  )

  get '/api/v2/idea_topics' do
    route_summary '[deprecated] List relations between ideas and topics'
    route_description <<~DESC.squish
      Idea topics represent associations between ideas and topics. This is a
      many-to-many relationship: Ideas can have multiple topics, and topics can
      be associated with multiple ideas.

      This endpoint is deprecated and will be removed in future versions. Please use
      the `/api/v2/ideas_input_topics` instead.
    DESC

    let_it_be(:idea_input_topics) do
      2.times do |index|
        create(:idea_with_topics, topics_count: index + 1)
      end

      IdeasInputTopic.all
    end

    example_request 'List all associations between ideas and topics' do
      assert_status 200

      expected_idea_input_topics = idea_input_topics.map do |idea_input_topic|
        {
          topic_id: idea_input_topic.input_topic_id,
          idea_id: idea_input_topic.idea_id
        }
      end

      expect(json_response_body[:idea_topics]).to match_array(expected_idea_input_topics)
    end

    describe 'when filtering by idea ID' do
      let(:idea) { create(:idea_with_topics, topics_count: 2) }
      let(:idea_id) { idea.id }

      example_request 'List only idea-topic associations for the specified idea', document: false do
        assert_status 200

        expected_idea_topics = idea.input_topic_ids.map do |topic_id|
          { topic_id: topic_id, idea_id: idea_id }
        end

        expect(json_response_body[:idea_topics]).to match_array(expected_idea_topics)
      end
    end

    describe 'when filtering by topic ID' do
      let(:topic) { create(:input_topic) }
      let(:topic_id) { topic.id }
      let!(:ideas) do
        create_list(:idea, 2).each { |idea| idea.input_topics << topic }
      end

      example_request 'List only idea-topic associations for the specified topic', document: false do
        assert_status 200

        expected_idea_topics = ideas.map do |idea|
          { topic_id: topic_id, idea_id: idea.id }
        end

        expect(json_response_body[:idea_topics]).to match_array(expected_idea_topics)
      end
    end
  end
end
