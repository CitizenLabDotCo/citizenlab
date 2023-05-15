# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'ProjectsAllowedInputTopics' do
  explanation 'E.g. mobility, health, culture...'

  before do
    header 'Content-Type', 'application/json'
    @projects_allowed_input_topics = create_list(:projects_allowed_input_topic, 2)
  end

  get 'web_api/v1/projects/:id/projects_allowed_input_topics' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of topics per page'
    end

    let(:id) { @projects_allowed_input_topics.first.project_id }

    example_request 'List all projects allowed input topics of a project' do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 1
    end
  end

  get 'web_api/v1/projects_allowed_input_topics/:id' do
    let(:id) { @projects_allowed_input_topics.first.id }

    example_request 'Get one projects topic by id' do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq @projects_allowed_input_topics.first.id
    end
  end

  context 'when admin' do
    before { admin_header_token }

    post 'web_api/v1/projects_allowed_input_topics' do
      with_options scope: :projects_allowed_input_topic do
        parameter :project_id, 'The project ID', required: true
        parameter :topic_id, 'The topic ID', required: true
      end
      ValidationErrorHelper.new.error_fields(self, ProjectsAllowedInputTopic)

      let(:topic_id) { create(:topic).id }
      let(:project_id) { create(:project).id }

      example 'Add a topic to a project' do
        old_count = ProjectsAllowedInputTopic.count
        do_request
        expect(response_status).to eq 201
        expect(ProjectsAllowedInputTopic.count).to eq(old_count + 1)
      end
    end

    delete 'web_api/v1/projects_allowed_input_topics/:id' do
      let!(:id) { create(:projects_allowed_input_topic).id }

      example 'Delete a topic from a project' do
        old_count = ProjectsAllowedInputTopic.count
        do_request
        expect(response_status).to eq 200
        expect { ProjectsAllowedInputTopic.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
        expect(ProjectsAllowedInputTopic.count).to eq(old_count - 1)
      end
    end

    patch 'web_api/v1/projects_allowed_input_topics/:id/reorder' do
      with_options scope: :projects_allowed_input_topic do
        parameter :ordering, 'The position, starting from 0, where the field should be at. Fields after will move down.', required: true
      end

      let(:project) { create(:project, allowed_input_topics: create_list(:topic, 3)) }
      let(:id) { project.projects_allowed_input_topics.order(:ordering).last.id }
      let(:ordering) { 0 }

      example_request 'Reorder a project allowed input topic' do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :ordering)).to eq ordering
      end
    end
  end
end
