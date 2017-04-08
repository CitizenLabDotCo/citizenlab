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

    get "api/v1/users/:id" do
      before do
        @user = create(:user)
      end
      let(:id) {@user.id}
      example "Get a non-authenticated user does not expose the email", document: false do
        do_request
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :email)).to be_nil
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

    get "api/v1/users/:id" do
      let(:id) {@user.id}
      example_request "Get the authenticated user exposes the email field" do
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :email)).to eq @user.email
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
        parameter :first_name, "User full name", required: true
        parameter :last_name, "User full name", required: true
        parameter :email, "E-mail address", required: true
        parameter :password, "Password", required: true
        parameter :locale, "Locale. Should be one of the tenants locales", required: true
      end

      let(:first_name) {Faker::Name.first_name}
      let(:last_name) {Faker::Name.last_name}
      let(:email) {Faker::Internet.email}
      let(:password) {Faker::Internet.password}
      let(:locale) { "en" }

      example_request "Create a new user" do
        expect(response_status).to eq 201
      end
    end

    put "api/v1/users/:id" do
      with_options scope: 'user' do
        parameter :first_name, "User full name"
        parameter :last_name, "User full name"
        parameter :email, "E-mail address"
        parameter :password, "Password"
        parameter :locale, "Locale. Should be one of the tenants locales"
      end

      let(:id) { @user.id }
      let(:first_name) { "Edmond" }

      example_request "Edit a user" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :first_name)).to eq "Edmond"
      end
    end
  end
end
