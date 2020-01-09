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

  post "admin_api/users" do

    with_options scope: :user do
      parameter :first_name, "The first name", required: true
      parameter :last_name, "The last name", required: true
      parameter :email, "The email", required: true
      parameter :password, "The password", required: true
      parameter :roles, "The roles of the user"
    end
    ValidationErrorHelper.new.error_fields(self, User)

    let(:first_name) { 'Jaak' }
    let(:last_name) { 'Brijl' }
    let(:email) { 'admin@citizenlab.co' }
    let(:password) { 'nmQuiteP4s' }
    let(:roles) { [{type: 'admin'}] }

    describe do
      example_request "Create a user" do
        expect(response_status).to eq 201
        json_response = json_parse(response_body)
        byebug
        expect(json_response[:last_name]).to eq 'Brijl'
      end
    end
  end

end