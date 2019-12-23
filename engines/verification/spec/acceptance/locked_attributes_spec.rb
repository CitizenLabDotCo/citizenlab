require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Users - Locked attributes" do

  explanation "List the attributes the user can't change in their profile, since they're controlled by a verification method"

  before do
    header "Content-Type", "application/json"
      @user = create(:user)
      create(:verification, method_name: 'franceconnect', user: @user)
      token = Knock::AuthToken.new(payload: @user.to_token_payload).token
      header 'Authorization', "Bearer #{token}"
  end

  get "web_api/v1/users/me/locked_attributes" do
    with_options scope: :page do
      parameter :number, "Page number"
      parameter :size, "Number of verification methods per page"
    end

    example_request "List locked built-in attributes for authenticated user" do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].map{|d| d[:attributes][:name]}).to eq ['first_name', 'last_name']
    end
  end

end
