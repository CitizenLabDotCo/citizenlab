require 'rails_helper'
require 'rspec_api_documentation/dsl'


resource "Users" do

  explanation "Citizens and city administrators."

  before do
    header "Content-Type", "application/json"
  end

  context "when not authenticated" do

    get "web_api/v1/users/me" do
      example_request "[error] Get the authenticated user" do
        expect(status).to eq(404)
      end
    end

    get "web_api/v1/users" do
      with_options scope: :page do
        parameter :number, "Page number"
        parameter :size, "Number of users per page"
      end
      parameter :search, 'Filter by searching in first_name, last_name and email', required: false
      parameter :sort, "Sort user by 'created_at', '-created_at', 'last_name', '-last_name', 'email', '-email', 'role', '-role'", required: false
      parameter :group, "Filter by group_id", required: false
      parameter :can_moderate_project, "Filter by users (and admins) who can moderate the project (by id)", required: false
      parameter :can_moderate, "Filter out admins and moderators", required: false

      example_request "[error] List all users" do
        expect(status).to eq 401
      end
    end

    get "web_api/v1/users/as_xlsx" do
      parameter :group, "Filter by group_id", required: false
      parameter :users, "Filter out only users with the provided user ids", required: false

      example_request "[error] XLSX export" do
        expect(status).to eq 401
      end
    end

    get "web_api/v1/users/:id" do
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

    post "web_api/v1/user_token" do
      with_options scope: :auth do
        parameter :email, "Email"
        parameter :password, "Password"
      end

      context "with phone password_login turned off" do
        before do
          @user = create(:user, password: 'supersecret')
        end
        let(:email) { @user.email }
        let(:password) { 'supersecret' }

        example_request "Authenticate a registered user" do
          expect(status).to eq(201)
          json_response = json_parse(response_body)
          expect(json_response.dig(:jwt)).to be_present
        end

        example "[error] Authenticate an invited user" do
          @user.update! invite_status: 'pending'
          do_request
          expect(status).to eq(404)
        end
      end

      context "with phone password_login turned on" do
        before do
          settings = AppConfiguration.instance.settings
          settings['password_login'] = {
            "allowed" => true,
            "enabled" => true,
            "phone" => true,
            "phone_email_pattern" => "phone+__PHONE__@test.com"
          }
          AppConfiguration.instance.update!(settings: settings)
        end

        describe do
          let!(:user) { create(:user, email: 'phone+3248751212@test.com', password: 'supersecret')}
          let(:email) { '+324 875 12 12' }
          let(:password) { 'supersecret' }
          example_request "Authenticate a registered user by phone number", document: false do
            expect(status).to eq(201)
            json_response = json_parse(response_body)
            expect(json_response.dig(:jwt)).to be_present
          end
        end

        describe do
          let!(:user) { create(:user, password: 'supersecret')}
          let(:email) { user.email }
          let(:password) { 'supersecret' }
          example_request "Authenticate a registered user by email", document: false do
            expect(status).to eq(201)
            json_response = json_parse(response_body)
            expect(json_response.dig(:jwt)).to be_present
          end
        end
      end
    end

    post "web_api/v1/users" do
      with_options scope: 'user' do
        parameter :first_name, "User full name", required: true
        parameter :last_name, "User full name", required: true
        parameter :email, "E-mail address", required: true
        parameter :password, "Password", required: true
        parameter :locale, "Locale. Should be one of the tenants locales", required: true
        parameter :avatar, "Base64 encoded avatar image"
        parameter :roles, "Roles array, only allowed when admin"
        parameter :custom_field_values, "An object that can only contain keys for custom fields for users. If fields are required, their presence is required as well"
      end
      ValidationErrorHelper.new.error_fields(self, User)

      let(:first_name) { Faker::Name.first_name }
      let(:last_name) { Faker::Name.last_name }
      let(:email) { Faker::Internet.email }
      let(:password) { Faker::Internet.password }
      let(:locale) { "en" }
      let(:avatar) { base64_encoded_image }

      example_request "Create a user" do
        expect(response_status).to eq 201
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :registration_completed_at)).to be_present # when no custom fields
      end

      describe "Creating an admin user" do
        let(:roles) { [{type: 'admin'}] }

        example "creates a user, but not an admin", document: false do
          create(:admin) # there must be at least on admin, otherwise the next user will automatically be made an admin
          do_request
          expect(response_status).to eq 201
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :attributes, :roles)).to be_empty
        end
      end

      describe do
        let(:password) { "ab" }

        example_request "[error] Create an invalid user", document: false do
          expect(response_status).to eq 422
          json_response = json_parse(response_body)
          expect(json_response.dig(:errors, :password)).to eq [{:error=>"too_short", :count=>5}]
        end
      end

      describe do
        let!(:invitee) { create(:invited_user) }
        let(:email) { invitee.email }

        example_request "[error] Registering an invited user" do
          expect(response_status).to eq 422
          json_response = json_parse(response_body)
          expect(json_response.dig(:errors, :email)).to include({error: "taken_by_invite", value: email, inviter_email: invitee.invitee_invite.inviter.email})
        end
      end

      describe do
        before do
          create(:user, email: 'JeZuS@citizenlab.co')
        end
        let(:email) { 'jEzUs@citizenlab.co' }

        example_request "[error] Registering a user with case insensitive email duplicate", document: false do
          expect(response_status).to eq 422
        end
      end

      context "with phone password_login turned on" do
        before do
          settings = AppConfiguration.instance.settings
          settings['password_login'] = {
            "allowed" => true,
            "enabled" => true,
            "phone" => true,
            "phone_email_pattern" => "phone+__PHONE__@test.com"
          }
          AppConfiguration.instance.update!(settings: settings)
        end

        describe do
          let(:email) { "someone@citizenlab.co" }
          example_request "Register with email when an email is passed", document: false do
            expect(response_status).to eq 201
            json_response = json_parse(response_body)
            expect(User.find_by(email: email)).to be_present
          end
        end

        describe do
          let(:email) { "+32 487 36 58 98" }
          example_request "Registers a user with a phone number in the email when a phone number is passed", document: false do
            expect(response_status).to eq 201
            json_response = json_parse(response_body)
            expect(User.find_by(email: "phone+32487365898@test.com")).to be_present
          end
        end
      end
    end
  end

  context "when authenticated" do
    before do
      @user = create(:user, last_name: 'Hoorens')
      @users = ["Bednar", "Cole", "Hagenes", "MacGyver", "Oberbrunner"].map{|l| create(:user, last_name: l)}
      token = Knock::AuthToken.new(payload: @user.to_token_payload).token
      header 'Authorization', "Bearer #{token}"
    end

    context "when admin" do
      before do
        @user.update(roles: [{type: 'admin'}])
      end

      get "web_api/v1/users" do
        with_options scope: :page do
          parameter :number, "Page number"
          parameter :size, "Number of users per page"
        end
        parameter :search, 'Filter by searching in first_name, last_name and email', required: false
        parameter :sort, "Sort user by 'created_at', '-created_at', 'last_name', '-last_name', 'email', '-email', 'role', '-role'", required: false
        parameter :group, "Filter by group_id", required: false
        parameter :can_moderate_project, "Filter by users (and admins) who can moderate the project (by id)", required: false
        parameter :can_moderate, "Filter out admins and moderators", required: false

        describe "List all users in group" do
          example "with correct pagination", document: false do
            page_size = 5
            project = create(:project)
            group = create(:smart_group, rules: [
              {ruleType: 'participated_in_project', predicate: 'in', value: project.id}
            ])
            (page_size + 1).times.map do |i|
              create(:idea, project: project, author: create(:user))
            end

            do_request(group: group.id, page: {number: 1, size: page_size})
            json_response = json_parse(response_body)

            expect(json_response[:links][:next]).to be_present
          end
        end
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
