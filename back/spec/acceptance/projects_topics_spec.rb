require 'rails_helper'
require 'rspec_api_documentation/dsl'


resource "Topics" do

  explanation "E.g. mobility, health, culture..."

  before do
    header "Content-Type", "application/json"
    @projects_topics = create_list(:projects_topic, 2)
  end

  get "web_api/v1/projects_topics" do
    with_options scope: :page do
      parameter :number, "Page number"
      parameter :size, "Number of topics per page"
    end
    
    example_request "List all projects topics" do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 2
    end
  end

  get "web_api/v1/projects/:id/projects_topics" do
    with_options scope: :page do
      parameter :number, "Page number"
      parameter :size, "Number of topics per page"
    end

    let(:id) { @projects_topics.first.project_id }
    
    example_request "List all projects topics of a project" do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 1
    end
  end

  get "web_api/v1/projects_topics/:id" do
    let(:id) {@projects_topics.first.id}

    example_request "Get one projects topic by id" do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq @projects_topics.first.id
    end
  end

  context "when admin" do
    before do
      @admin = create(:admin)
      token = Knock::AuthToken.new(payload: @admin.to_token_payload).token
      header 'Authorization', "Bearer #{token}"
    end

    post "web_api/v1/projects_topics" do
      with_options scope: :projects_topic do
        parameter :project_id, "The project ID", required: true
        parameter :topic_id, "The topic ID", required: true
      end
      ValidationErrorHelper.new.error_fields(self, ProjectsTopic)

      let(:topic_id) { create(:topic).id }
      let(:project_id) { create(:project).id }

      example "Add a topic to a project" do
        old_count = ProjectsTopic.count
        do_request
        expect(response_status).to eq 201
        expect(ProjectsTopic.count).to eq (old_count + 1)
      end
    end

    delete "web_api/v1/projects_topics/:id" do
      let!(:id) { create(:projects_topic).id }

      example "Delete a topic from a project" do
        old_count = ProjectsTopic.count
        do_request
        expect(response_status).to eq 200
        expect{ProjectsTopic.find(id)}.to raise_error(ActiveRecord::RecordNotFound)
        expect(ProjectsTopic.count).to eq (old_count - 1)
      end
    end

    patch "web_api/v1/projects_topics/:id/reorder" do
      with_options scope: :projects_topic do
        parameter :ordering, "The position, starting from 0, where the field should be at. Fields after will move down.", required: true
      end

      let(:project) { create(:project, topics: create_list(:topic, 3)) }
      let(:id) { project.projects_topics[1].id }
      let(:ordering) { 0 }

      example_request "Reorder a project topic" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:attributes,:ordering)).to eq ordering
      end
    end
  end

end
