# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require './engines/commercial/public_api/spec/acceptance/v2/support/shared'

resource 'Topics' do
  include_context 'common_auth'

  parameter(
    :project_id,
    'Filter by project ID',
    required: false,
    type: :string,
    in: :query
  )

  parameter(
    :global_topic_id,
    'Filter by global topic ID',
    required: false,
    type: :string,
    in: :query
  )

  get '/api/v2/project_global_topics' do
    route_summary 'List associations between global topics and projects'
    route_description <<~DESC.squish
      Project topics represent associations between projects and topics. This is a
      many-to-many relationship: Projects can have multiple topics, and topics can
      be associated with multiple projects.
    DESC

    let_it_be(:project_global_topics) do
      create_list(:project, 2).each_with_index do |project, index|
        project.global_topics << create_list(:global_topic, index + 1)
      end

      ProjectsGlobalTopic.all
    end

    example_request 'List all associations between projects and topics' do
      assert_status 200

      expected_project_global_topics = project_global_topics.map do |project_topic|
        {
          project_id: project_topic.project_id,
          global_topic_id: project_topic.global_topic_id,
          created_at: project_topic.created_at.iso8601(3),
          updated_at: project_topic.updated_at.iso8601(3)
        }
      end

      expect(json_response_body[:project_global_topics]).to match_array(expected_project_global_topics)
    end

    describe 'when filtering by project ID' do
      let(:project) do
        topics = create_list(:global_topic, 2)
        create(:project).tap { |project| project.global_topics << topics }
      end
      let(:project_id) { project.id }

      example_request 'List only project-topic associations for the specified project', document: false do
        assert_status 200

        expected_project_topics = ProjectsGlobalTopic.where(project_id: project.id).map do |project_topic|
          {
            project_id: project_topic.project_id,
            global_topic_id: project_topic.global_topic_id,
            created_at: project_topic.created_at.iso8601(3),
            updated_at: project_topic.updated_at.iso8601(3)
          }
        end

        expect(json_response_body[:project_global_topics]).to match_array(expected_project_topics)
      end
    end

    describe 'when filtering by global topic ID' do
      let(:topic) { create(:global_topic) }
      let(:global_topic_id) { topic.id }

      before do
        create_list(:project, 2).each do |project|
          project.global_topics << topic
        end
      end

      example_request 'List only project-topic associations for the specified global topic', document: false do
        assert_status 200

        expected_project_topics = ProjectsGlobalTopic.where(global_topic_id: global_topic_id).map do |project_topic|
          {
            project_id: project_topic.project_id,
            global_topic_id: project_topic.global_topic_id,
            created_at: project_topic.created_at.iso8601(3),
            updated_at: project_topic.updated_at.iso8601(3)
          }
        end

        expect(json_response_body[:project_global_topics]).to match_array(expected_project_topics)
      end
    end
  end
end
