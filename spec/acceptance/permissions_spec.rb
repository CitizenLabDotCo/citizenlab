require 'rails_helper'
require 'rspec_api_documentation/dsl'


resource "Permissions" do
 
  explanation 'These determine who (e.g. groups) can take which actions (e.g. posting, voting) in a participation context'

  before do
    header "Content-Type", "application/json"
    @project = create(:continuous_project_with_permissions)
  end
  let(:permittable_id) {@project.id}

  context "when admin" do
    before do
      @admin = create(:admin)
      token = Knock::AuthToken.new(payload: { sub: @admin.id }).token
      header 'Authorization', "Bearer #{token}"
    end

    get "web_api/v1/projects/:permittable_id/permissions" do
      with_options scope: :page do
        parameter :number, "Page number"
        parameter :size, "Number of permissions per page"
      end

      example_request "List all permissions of a project" do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq PermissionsService::IDEATION_ACTIONS.size
      end
    end

    get "web_api/v1/projects/:permittable_id/permissions/:action" do
      let(:action) {@project.permissions.first.action}

      example_request "Get one permission by id" do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq @project.permissions.first.id
      end
    end
  end
end
