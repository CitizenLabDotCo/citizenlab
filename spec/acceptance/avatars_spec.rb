require 'rails_helper'
require 'rspec_api_documentation/dsl'


resource "Avatars" do
 
  explanation "Avatars are user images user setup in their profile. To edit them, use the users endpoints"

  before do
    header "Content-Type", "application/json"
    @user_without_avatar = create(:user, avatar: nil)
    @users_with_avatar = create_list(:user, 6)
  end

  get "web_api/v1/avatars" do

    parameter :limit, "Number of avatars to return. Defaults to 5. Maximum 10.", default: false

    example_request "List random user avatars" do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 5
      expect(json_response.dig(:data).map{|d| d.dig(:attributes, :avatar).keys}).to all(eq [:small, :medium, :large])
      expect(json_response.dig(:data).flat_map{|d| d.dig(:attributes, :avatar).values}).to all(be_present)
      expect(json_response.dig(:data).map{|d| d.dig(:id)}).to_not include(@user_without_avatar.id)
    end

  end

end
