require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Users" do
  header "Content-Type", "application/json"

  context "when not authenticated" do

    get "api/v1/users/me" do
      example_request "Get the authenticated user" do
        expect(status).to eq(403)
      end
    end
  end

  context "when authenticated" do
    before do
      @user = create(:user)
      token = Knock::AuthToken.new(payload: { sub: @user.id }).token
      header 'Authorization', "Bearer #{token}"
    end

    get "api/v1/users" do
      example_request "Get all users" do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 1
      end
    end

    get "api/v1/users/:id" do
      let(:id) {@user.id}

      example_request "Get a user by id" do
        do_request
        expect(status).to eq 200
      end
    end

    get "api/v1/users/me" do
      example_request "Get the authenticated user" do
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq(@user.id)
      end
    end

    post "api/v1/users" do
      with_options scope: 'user' do
        parameter :name, "User full name", required: true
        parameter :email, "E-mail address", required: true
        parameter :password, "Password", required: true
      end

      let(:name) {Faker::Name.name}
      let(:email) {Faker::Internet.email}
      let(:password) {Faker::Internet.password}

      example_request "Create a new user" do
        expect(response_status).to eq 201
      end
    end
  end
end
