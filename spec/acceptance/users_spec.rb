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
      create_list(:user, 5)
      token = Knock::AuthToken.new(payload: { sub: @user.id }).token
      header 'Authorization', "Bearer #{token}"
    end

    context "when admin" do
      before do
        @user.update(roles: [{type: 'admin'}])
      end

      get "api/v1/users" do
        example_request "Get all users" do
          expect(status).to eq 200
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 6
        end
      end

      get "api/v1/users" do
        example "Get all users on the second page with fixed page size" do
          do_request({"page[number]" => 2, "page[size]" => 2})
          expect(status).to eq 200
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 2
        end
      end

      get "api/v1/users/as_xlsx" do
        example_request "XLSX export" do
          expect(status).to eq 200
        end
      end
    end

    get "api/v1/users" do
      example "Get all users as non-admin", document: false do
        do_request
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
        parameter :avatar, "Base64 encoded avatar image"
        parameter :roles, "Roles array, only allowed when admin"
        parameter :gender, "Either 'male', 'female' or 'unspecified'"
        parameter :birthyear, "The year, as an integer, the user was born"
        parameter :domicile, "Either an exisiting Area id or 'outside', to specify the user does not live in the city"
        parameter :education, "An integer from 0 to 8 (inclusive), corresponding to the ISCED 2011 standard"
        parameter :bio_multiloc, "A little text, allowing the user to describe herself. Multiloc and non-html"
      end

      let(:first_name) {Faker::Name.first_name}
      let(:last_name) {Faker::Name.last_name}
      let(:email) {Faker::Internet.email}
      let(:password) {Faker::Internet.password}
      let(:locale) { "en" }
      let(:avatar) { base64_encoded_image }
      let(:gender) { "female" }

      example_request "Create a new user" do
        expect(response_status).to eq 201
      end

      describe "Creating an admin user" do
        let(:roles) { [{type: 'admin'}] }
        example "creates a user, but not an admin", document: false do
          do_request
          expect(response_status).to eq 201
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :attributes, :roles)).to be_empty
        end
      end
    end

    put "api/v1/users/:id" do
      with_options scope: 'user' do
        parameter :first_name, "User full name"
        parameter :last_name, "User full name"
        parameter :email, "E-mail address"
        parameter :password, "Password"
        parameter :locale, "Locale. Should be one of the tenants locales"
        parameter :avatar, "Base64 encoded avatar image"
        parameter :roles, "Roles array, only allowed when admin"
        parameter :gender, "Either 'male', 'female' or 'unspecified'"
        parameter :birthyear, "The year, as an integer, the user was born"
        parameter :domicile, "Either an exisiting Area id or 'outside', to specify the user does not live in the city"
        parameter :education, "An integer from 0 to 8 (inclusive), corresponding to the ISCED 2011 standard"
        parameter :bio_multiloc, "A little text, allowing the user to describe herself. Multiloc and non-html"
      end

      let(:id) { @user.id }
      let(:first_name) { "Edmond" }

      example_request "Edit a user" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :first_name)).to eq "Edmond"
      end
    end

    delete "api/v1/users/:id" do
      before do
        @user.update(roles: [{type: 'admin'}])
        @subject_user = create(:user)
      end
      let(:id) { @subject_user.id }
      example_request "Delete a user" do
        expect(response_status).to eq 200
        expect{User.find(id)}.to raise_error(ActiveRecord::RecordNotFound)
      end
    end

  end


  private


  def base64_encoded_image
    "data:image/jpeg;base64,#{encode_image_as_base64("lorem-ipsum.jpg")}"
  end

  def encode_image_as_base64(filename)
    Base64.encode64(File.read(Rails.root.join("spec", "fixtures", filename)))
  end
end
