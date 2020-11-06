require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "User", admin_api: true do

  before do
    header "Content-Type", "application/json"
    header 'Authorization', ENV.fetch("ADMIN_API_TOKEN")
  end

  let!(:user) { create(:user, email: 'moderator@citizenlab.co') }

  get "admin_api/users" do
    with_options scope: :page do
      parameter :number, "Page number"
      parameter :size, "Number of users per page"
    end

    before do
      create_list(:user, 5)
    end

    example_request "Get all users" do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.size).to eq 6
      expect(json_response.map{|u| u[:email]}).to match_array User.all.pluck(:email) 
    end

    example "Get users on first page" do
      do_request(page: {number: 1, size: 3})
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.size).to eq 3
    end
  end

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
      parameter :custom_field_values, "All custom field values, if given overwrites the existing values"
    end
    ValidationErrorHelper.new.error_fields(self, User)

    let(:id) { user.id }
    let(:first_name) { 'Jacqueline' }
    let(:roles) { [{type: 'admin'}] }
    let!(:cf) { create(:custom_field, key: 'favourite_drink') }
    let (:custom_field_values) { { favourite_drink: "wine" } }

    describe do
      example_request "Update a user" do
        expect(status).to be 200
        json_response = json_parse(response_body)
        expect(json_response[:first_name]).to eq 'Jacqueline'
        expect(json_response[:custom_field_values]).to eq({ favourite_drink: "wine" })
      end
    end
  end

end
