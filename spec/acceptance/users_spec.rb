require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Users" do
  header "Content-Type", "application/json"

  context "when not authenticated" do
  #   get "api/v1/users" do
  #     it "returns 401" do
  #       do_request
  #       expect(status).to eq 401
  #     end
  #   end
    get "api/v1/users/me" do
      example_request "returns the authenticated user" do
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
      it "returns list of users" do
        do_request
        expect(status).to eq 200
        expect(json_response[:data].size).to eq 1
      end
    end

    get "api/v1/users/:id" do
      let(:id) {@user.id}

      it "returns a user by id" do
        do_request
        expect(status).to eq 200
      end
    end

    get "api/v1/users/me" do
      example_request "returns the authenticated user" do
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

      it "creates new user" do
        do_request
        expect(response_status).to eq 201
      end
    end
  end
end
