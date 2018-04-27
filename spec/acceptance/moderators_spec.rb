require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Moderators" do
  before do
    header "Content-Type", "application/json"
  end


  get "web_api/v1/projects/:project_id/moderators" do
    with_options scope: :page do
      parameter :number, "Page number"
      parameter :size, "Number of members per page"
    end

    context "when moderator" do
      before do
        @project = create(:project)
        @moderator = create(:moderator, project: @project)
        token = Knock::AuthToken.new(payload: { sub: @moderator.id }).token
        header 'Authorization', "Bearer #{token}"
      end

      let(:project_id) { @project.id }
      let!(:same_project_moderators) { create_list(:moderator, 5, project: @project) }
      let!(:other_project) { create(:project) }
      let!(:other_project_moderators) { create_list(:moderator, 2, project: other_project) }
      example_request "List all moderators of a project" do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq same_project_moderators.size + 1
      end

      example "Listing moderators of a project you don't moderate should fail" do
        do_request project_id: other_project.id
        expect(status).to eq(401)
      end
    end

    context "when admin" do
      before do
        @project = create(:project)
        @admin = create(:admin)
        token = Knock::AuthToken.new(payload: { sub: @admin.id }).token
        header 'Authorization', "Bearer #{token}"
      end

      let(:project_id) { @project.id }
      let!(:same_project_moderators) { create_list(:moderator, 2, project: @project) }
      example_request "List all moderators of a project" do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq same_project_moderators.size
      end
    end
  end

  get "web_api/v1/projects/:project_id/moderators/:user_id" do
    ValidationErrorHelper.new.error_fields(self, User)

    context "when moderator" do
      before do
        @project = create(:project)
        @moderator = create(:moderator, project: @project)
        token = Knock::AuthToken.new(payload: { sub: @moderator.id }).token
        header 'Authorization', "Bearer #{token}"
      end

      let(:other_moderators) { create_list(:moderator, 2, project: @project) }
      let(:project_id) { @project.id }
      let(:user_id) { other_moderators.first.id }

      example_request "Get one moderator by id" do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq other_moderators.first.id
      end
    end
  end

  post "web_api/v1/projects/:project_id/moderators" do
    with_options scope: :moderator do
        parameter :user_id, "The id of user to become moderator (the id of the moderator will be the same).", required: true
      end
    ValidationErrorHelper.new.error_fields(self, User)
    
    context "when moderator" do
      before do
        @project = create(:project)
        @moderator = create(:moderator, project: @project)
        token = Knock::AuthToken.new(payload: { sub: @moderator.id }).token
        header 'Authorization', "Bearer #{token}"
      end

      let(:project_id) { @project.id }
      let(:user_id) { create(:user).id }

      example_request "Add a moderator role" do
        expect(response_status).to eq 201
        json_response = json_parse(response_body)
        expect(json_response.dig(:data,:id)).to eq user_id
      end
    end
  end

  delete "web_api/v1/projects/:project_id/moderators/:user_id" do
    ValidationErrorHelper.new.error_fields(self, User)

    context "when moderator" do
      before do
        @project = create(:project)
        @moderator = create(:moderator, project: @project)
        token = Knock::AuthToken.new(payload: { sub: @moderator.id }).token
        header 'Authorization', "Bearer #{token}"
      end

      let(:other_moderators) { create_list(:moderator, 2, project: @project) }
      let(:project_id) { @project.id }
      let(:user_id) { other_moderators.first.id }

      example("Delete the moderator role of a user for a project") do
        n_roles_before = other_moderators.first.reload.roles.size
        do_request
        expect(response_status).to eq 200
        expect(other_moderators.first.reload.roles.size).to eq(n_roles_before - 1)
      end
    end
  end
end