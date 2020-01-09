require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "User", admin_api: true do

  before do
    header "Content-Type", "application/json"
    header 'Authorization', ENV.fetch("ADMIN_API_TOKEN")
  end

  let!(:user) { create(:user, email: 'moderator@citizenlab.co') }
  let(:user_id) { user.id }

  get "admin_api/users/by_email" do
    parameter :email, "The email of the user"

    let(:email) { 'moderator@citizenlab.co' }

    example_request "Get one users by email" do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response[:email]).to eq 'moderator@citizenlab.co'
    end
  end

end