# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require './engines/commercial/public_api/spec/acceptance/v2/support/shared'

resource 'Ideas Input Topics' do
  include_context 'common_auth'

  parameter(
    :idea_id,
    'Filter by idea ID',
    required: false,
    type: :string,
    in: :query
  )

  parameter(
    :input_topic_id,
    'Filter by input topic ID',
    required: false,
    type: :string,
    in: :query
  )

  get '/api/v2/ideas_input_topics' do
    route_summary 'List relations between ideas and input topics'
    route_description <<~DESC.squish
      Ideas input topics represent associations between ideas and input topics. This is a
      many-to-many relationship: Ideas can have multiple input topics, and input topics can
      be associated with multiple ideas.
    DESC

    let_it_be(:ideas_input_topics) do
      2.times do |index|
        create(:idea_with_topics, topics_count: index + 1)
      end

      IdeasInputTopic.all
    end

    example_request 'List all associations between ideas and input topics' do
      assert_status 200

      expected_ideas_input_topics = ideas_input_topics.map do |ideas_input_topic|
        {
          input_topic_id: ideas_input_topic.input_topic_id,
          idea_id: ideas_input_topic.idea_id
        }
      end

      expect(json_response_body[:ideas_input_topics]).to match_array(expected_ideas_input_topics)
    end

    describe 'when filtering by idea ID' do
      let(:idea) { create(:idea_with_topics, topics_count: 2) }
      let(:idea_id) { idea.id }

      example_request 'List only idea-input topic associations for the specified idea', document: false do
        assert_status 200

        expected_ideas_input_topics = idea.input_topic_ids.map do |input_topic_id|
          { input_topic_id: input_topic_id, idea_id: idea_id }
        end

        expect(json_response_body[:ideas_input_topics]).to match_array(expected_ideas_input_topics)
      end
    end

    describe 'when filtering by input topic ID' do
      let(:input_topic) { create(:input_topic) }
      let(:input_topic_id) { input_topic.id }
      let!(:ideas) do
        create_list(:idea, 2).each { |idea| idea.input_topics << input_topic }
      end

      example_request 'List only idea-input topic associations for the specified input topic', document: false do
        assert_status 200

        expected_ideas_input_topics = ideas.map do |idea|
          { input_topic_id: input_topic_id, idea_id: idea.id }
        end

        expect(json_response_body[:ideas_input_topics]).to match_array(expected_ideas_input_topics)
      end
    end
  end
end
