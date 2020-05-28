require 'rails_helper'
require 'rspec_api_documentation/dsl'


resource "Topics" do

  explanation "E.g. mobility, health, culture..."

  before do
    header "Content-Type", "application/json"
    @topics = create_list(:topic, 5)
  end

  get "web_api/v1/topics" do
    with_options scope: :page do
      parameter :number, "Page number"
      parameter :size, "Number of topics per page"
    end
    parameter :code, 'Filter by code', required: false
    
    example_request "List all topics" do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 5
    end

    example "List all topics by code" do
      @topics.first.update!(code: 'nature')
      do_request code: 'custom'
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 4
    end
  end

  get "web_api/v1/topics/:id" do
    let(:id) {@topics.first.id}

    example_request "Get one topic by id" do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq @topics.first.id
    end
  end

  context "when admin" do
    before do
      @admin = create(:admin)
      token = Knock::AuthToken.new(payload: @admin.to_token_payload).token
      header 'Authorization', "Bearer #{token}"
    end

    post "web_api/v1/topics" do
      with_options scope: :topic do
        parameter :title_multiloc, "The title of the topic, as a multiloc string", required: true
        parameter :description_multiloc, "The description of the topic, as a multiloc string", required: false
      end
      ValidationErrorHelper.new.error_fields(self, Topic)

      let(:topic) { build(:topic) }
      let(:title_multiloc) { topic.title_multiloc }

      example_request "Create a topic" do
        expect(response_status).to eq 201
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:attributes,:title_multiloc).stringify_keys).to match title_multiloc
      end
    end

    patch "web_api/v1/topics/:id" do
      with_options scope: :topic do
        parameter :title_multiloc, "The title of the topic, as a multiloc string"
        parameter :description_multiloc, "The description of the topic, as a multiloc string"
      end
      ValidationErrorHelper.new.error_fields(self, Topic)

      let(:topic) { create(:topic) }
      let(:id) { topic.id }
      let(:title_multiloc) { {'en' => "Comedy"} }
      let(:description_multiloc) { {'en' => "Stuff that tends to make you laugh"} }

      example_request "Update a topic" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:attributes,:title_multiloc).stringify_keys).to match title_multiloc
        expect(json_response.dig(:data,:attributes,:description_multiloc).stringify_keys).to match description_multiloc
      end
    end

    patch "web_api/v1/topics/:id/reorder" do
      with_options scope: :topic do
        parameter :ordering, "The position, starting from 0, where the field should be at. Fields after will move down.", required: true
      end

      let(:id) { create(:topic).id }
      let(:ordering) { 1 }

      example_request "Reorder a topic globally" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:attributes,:ordering)).to eq ordering
      end
    end

    delete "web_api/v1/topics/:id" do

      let(:topic) { create(:topic) }
      let!(:id) { topic.id }

      example "Delete a topic" do
        old_count = Topic.count
        do_request
        expect(response_status).to eq 200
        expect{Topic.find(id)}.to raise_error(ActiveRecord::RecordNotFound)
        expect(Topic.count).to eq (old_count - 1)
      end
    end

    post "web_api/v1/projects/:project_id/topics" do
      ValidationErrorHelper.new.error_fields(self, ProjectsTopic)

      parameter :topic_id, "The ID of the topic to add"

      let(:project_id) { create(:project).id }
      let(:topic_id) { create(:topic).id }

      example "Add a topic to a project" do
        old_count = ProjectsTopic.count
        do_request
        expect(response_status).to eq 201
        expect(ProjectsTopic.count).to eq (old_count + 1)
      end
    end

    delete "web_api/v1/projects/:project_id/topics/:topic_id" do
      let(:projects_topic) { create(:projects_topic) }
      let(:project_id) { projects_topic.project_id }
      let(:topic_id) { projects_topic.topic_id }

      example "Delete a topic from a project" do
        id = projects_topic.id
        old_count = ProjectsTopic.count
        do_request
        expect(response_status).to eq 200
        expect{ProjectsTopic.find(id)}.to raise_error(ActiveRecord::RecordNotFound)
        expect(ProjectsTopic.count).to eq (old_count - 1)
      end
    end
  end

  get "web_api/v1/projects/:project_id/topics" do
    with_options scope: :page do
      parameter :number, "Page number"
      parameter :size, "Number of topics per page"
    end

    let(:topics) { @topics.take(2) }
    let(:project_id) { create(:project, topics: topics).id }
    
    example_request "List all topics of a project" do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 2
    end
  end

  context "when admin" do
    before do
      @admin = create(:admin)
      token = Knock::AuthToken.new(payload: @admin.to_token_payload).token
      header 'Authorization', "Bearer #{token}"
    end

    patch "web_api/v1/projects/:project_id/topics/:topic_id/reorder" do
      with_options scope: :topic do
        parameter :ordering, "The position, starting from 0, where the field should be at. Fields after will move down.", required: true
      end

      let(:topics) { @topics.take(3) }
      let(:project_id) { create(:project, topics: topics).id }
      let(:topic_id) { topics[1].id }
      let(:ordering) { 0 }

      example_request "Reorder a topic within the context of a project" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:attributes,:ordering_within_project)).to eq ordering
      end
    end
  end

end
