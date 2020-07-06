require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "User", admin_api: true do

  before do
    header "Content-Type", "application/json"
    header 'Authorization', ENV.fetch("ADMIN_API_TOKEN")
  end

  let!(:user) { create(:user, email: 'moderator@citizenlab.co') }

  get "admin_api/users/by_email" do
    parameter :email, "The email of the user"

    let(:email) { 'moderator@citizenlab.co' }

    example_request "Get one user by email" do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response[:email]).to eq 'moderator@citizenlab.co'
    end
  end

  get "admin_api/users/:id" do
    let(:id) { user.id }

    example_request "Get one user by id" do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response[:id]).to eq user.id
    end
  end

  post "admin_api/users" do

    with_options scope: :user do
      parameter :first_name, "The first name", required: true
      parameter :last_name, "The last name", required: true
      parameter :email, "The email", required: true
      parameter :password, "The password", required: true
      parameter :roles, "The roles of the user"
      parameter :remote_avatar_url, "The user avatar"
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
        expect(json_response[:last_name]).to eq 'Brijl'
      end
    end
  end

  patch "admin_api/users/:id" do

    with_options scope: :user do
      parameter :first_name, "The first name"
      parameter :last_name, "The last name"
      parameter :email, "The email"
      parameter :password, "The password"
      parameter :roles, "The roles of the user"
      parameter :remote_avatar_url, "The user avatar"
    end
    ValidationErrorHelper.new.error_fields(self, User)

    let(:id) { user.id }
    let(:first_name) { 'Jacqueline' }
    let(:roles) { [{type: 'admin'}] }
    let(:remote_avatar_url) { 'https://res.cloudinary.com/citizenlabco/image/upload/v1528120749/shield_logo_pzbx2x.png' }

    describe do
      example_request "Update a user" do
        expect(status).to be 200
        json_response = json_parse(response_body)
        expect(json_response[:first_name]).to eq 'Jacqueline'
      end
    end
  end

end
