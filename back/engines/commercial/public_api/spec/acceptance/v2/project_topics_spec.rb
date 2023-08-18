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

  parameter(
    :project_id,
    'Filter by project ID',
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

  get '/api/v2/project_topics' do
    let_it_be(:project_topics) do
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

    describe 'when filtering by project ID' do
      let(:project) do
        topics = create_list(:topic, 2)
        create(:project).tap { |project| project.topics << topics }
      end
      let(:project_id) { project.id }

      example_request 'List only project-topic associations for the specified project', document: false do
        assert_status 200

        expected_project_topics = ProjectsTopic.where(project_id: project.id).map do |project_topic|
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

    describe 'when filtering by topic ID' do
      let(:topic) { create(:topic) }
      let(:topic_id) { topic.id }

      before do
        create_list(:project, 2).each do |project|
          project.topics << topic
        end
      end

      example_request 'List only project-topic associations for the specified topic', document: false do
        assert_status 200

        expected_project_topics = ProjectsTopic.where(topic_id: topic_id).map do |project_topic|
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
end
