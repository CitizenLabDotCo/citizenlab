require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Users" do
  header "Content-Type", "application/json"

  context "authenticated" do
    before do
      @current_user = create(:user)
      token = Knock::AuthToken.new(payload: { sub: @current_user.id }).token
      header 'Authorization', "Bearer #{token}"
    end

    get "api/v1/users" do
      example_request "Listing users" do
        do_request

        expect(status).to be(200)
      end
    end

    get "api/v1/users/:id" do
      let (:id) {@current_user.id}
      example_request "Get a user" do
        expect(status).to be 200
      end
    end
  end

  # get "api/v1/users" do
  #   example "Listing fails when not authenticated", document: false do
  #     do_request
  #     expect(response_status).to be 401
  #   end
  # end

  post "api/v1/users" do
    with_options scope: 'user' do
      parameter :name, "User full name", required: true
      parameter :email, "E-mail address", required: true
      parameter :password, "Password", required: true
    end

    let(:name) {Faker::Name.name}
    let(:email) {Faker::Internet.email}
    let(:password) {Faker::Internet.password}

    example_request "Creating a valid user" do
      expect(response_status).to be 201
    end
  end


end
