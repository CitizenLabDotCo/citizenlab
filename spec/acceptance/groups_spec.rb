require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Groups" do
  before do
    header "Content-Type", "application/json"
    @groups = create_list(:group, 3)
  end

  context "when authenticated" do
    before do
      @user = create(:admin)
      token = Knock::AuthToken.new(payload: { sub: @user.id }).token
      header 'Authorization', "Bearer #{token}"
    end

    get "api/v1/groups" do
      with_options scope: :page do
        parameter :number, "Page number"
        parameter :size, "Number of events per page"
      end

      example_request "List all groups" do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 3
      end
    
    end
  end
end 