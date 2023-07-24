# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require './engines/commercial/public_api/spec/acceptance/v2/support/shared'

resource 'Project topics' do
  explanation <<~DESC.squish
    Project topics represent associations between projects and topics. This is a
    many-to-many relationship: Projects can have multiple topics, and topics can
    be associated with multiple projects.
  DESC

  include_context 'common_auth'

  get '/api/v2/project_topics' do
    let!(:project_topics) do
      create_list(:project, 2).each_with_index do |project, index|
        project.topics << create_list(:topic, index + 1)
      end

      ProjectsTopic.all
    end

    example_request 'List all associations between projects and topics' do
      assert_status 200

      expected_project_topics = project_topics.map do |project_topic|
        {
          project_id: project_topic.project_id,
          topic_id: project_topic.topic_id,
          created_at: project_topic.created_at.iso8601(3),
          updated_at: project_topic.updated_at.iso8601(3)
        }
      end

      expect(json_response_body[:project_topics]).to match_array(expected_project_topics)
    end
  end
end
