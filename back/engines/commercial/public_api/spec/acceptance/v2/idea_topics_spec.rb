# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require './engines/commercial/public_api/spec/acceptance/v2/support/shared'

resource 'Idea topics' do
  explanation <<~DESC.squish
    Idea topics represent associations between ideas and topics. This is a
    many-to-many relationship: Ideas can have multiple topics, and topics can
    be associated with multiple ideas.
  DESC

  include_context 'common_auth'

  get '/api/v2/idea_topics' do
    let!(:idea_topics) do
      2.times do |index|
        create(:idea_with_topics, topics_count: index + 1)
      end

      IdeasTopic.all
    end

    example_request 'List all associations between ideas and topics' do
      assert_status 200

      expected_idea_topics = idea_topics.map do |idea_topic|
        {
          topic_id: idea_topic.topic_id,
          idea_id: idea_topic.idea_id
        }
      end

      expect(json_response_body[:idea_topics]).to match_array(expected_idea_topics)
    end
  end
end
