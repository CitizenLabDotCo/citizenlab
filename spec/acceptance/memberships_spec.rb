require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Memberships" do
  before do
    header "Content-Type", "application/json"
    @group = create(:group)
    @users = create_list(:user, 5)
    @memberships = @users.map { |u| create(:membership, group: @group, user: u) }
  end

  context "when authenticated" do
    before do
      @user = create(:admin)
      token = Knock::AuthToken.new(payload: { sub: @user.id }).token
      header 'Authorization', "Bearer #{token}"
    end

    get "api/v1/groups/:group_id/memberships" do
      with_options scope: :page do
        parameter :number, "Page number"
        parameter :size, "Number of members per page"
      end

      let(:group_id) { @group.id }
      example_request "List all members of a group" do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 5
      end
    
    end

  end
end 