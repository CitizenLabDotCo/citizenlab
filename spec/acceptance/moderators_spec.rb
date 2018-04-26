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
end