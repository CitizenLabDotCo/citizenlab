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
  end

  context "when authenticated" do
    before do
      @user = create(:user)
      @users = create_list(:user, 5)
      token = Knock::AuthToken.new(payload: { sub: @user.id }).token
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

        example_request "List all users" do
          expect(status).to eq 200
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 6
        end

        example "Get all users on the second page with fixed page size" do
          do_request({"page[number]" => 2, "page[size]" => 2})
          expect(status).to eq 200
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 2
        end

        example "Search for users" do
          u1 = create(:user, first_name: 'Joskelala')
          u2 = create(:user, last_name: 'Rudolf')

          do_request search: "joskela"
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 1
          expect(json_response[:data][0][:id]).to eq u1.id
        end

        example "List all users sorted by last_name" do
          do_request sort: 'last_name'
          json_response = json_parse(response_body)

          expect(json_response[:data].size).to eq 6
          correctly_sorted = User.all.sort_by{|u| u.last_name}
          expect(json_response[:data].map{|u| u[:id]}).to eq correctly_sorted.map(&:id)
        end

        example "List all users in group" do
          group = create(:group)
          group_users = create_list(:user, 3, manual_groups: [group])

          do_request(group: group.id)
          json_response = json_parse(response_body)

          expect(json_response[:data].size).to eq 3
          expect(json_response[:data].map{|u| u[:id]}).to match_array group_users.map(&:id)

        end

        example "List all users in group, ordered by role" do
          group = create(:group)
          admin = create(:admin, manual_groups: [group])
          moderator = create(:moderator, manual_groups: [group])
          both = create(:moderator, manual_groups: [group])
          both.add_role 'admin'
          both.save!
          group_users = [admin,both,moderator] + create_list(:user, 3, manual_groups: [group])

          do_request(group: group.id, sort: '-role')
          json_response = json_parse(response_body)

          expect(json_response[:data].size).to eq 6
          expect(json_response[:data].map{|u| u[:id]}).to match_array group_users.map(&:id)
          expect(json_response[:data].map{|u| u[:id]}.reverse.take(2)).to match_array [admin.id,both.id]

        end
      end

      get "web_api/v1/users/as_xlsx" do
        parameter :group, "Filter by group_id", required: false
        parameter :users, "Filter out only users with the provided user ids", required: false

        example_request "XLSX export" do
          expect(status).to eq 200
        end

        describe do
          before do
            @users = create_list(:user, 10)
            @group = create(:group)
            @members = @users.shuffle.take(4)
            @members.each do |usr|
              create(:membership, user: usr, group: @group)
            end
          end
          let(:group) { @group.id }

          example_request "XLSX export all users from a group" do
            expect(status).to eq 200
            xlsx_hash = XlsxService.new.xlsx_to_hash_array  RubyXL::Parser.parse_buffer(response_body).stream
            expect(xlsx_hash.map{|r| r['id']}).to match_array @members.map(&:id)
          end
        end

        describe do
          before do
            @users = create_list(:user, 10)
            @group = create(:group)
            @selected = @users.shuffle.take(4)
          end
          let(:users) { @selected.map(&:id) }

          example_request "XLSX export all users given a list of user ids" do
            expect(status).to eq 200
            xlsx_hash = XlsxService.new.xlsx_to_hash_array  RubyXL::Parser.parse_buffer(response_body).stream
            expect(xlsx_hash.map{|r| r['id']}).to match_array @selected.map(&:id)
          end
        end

        describe do
          before do
            @users = create_list(:user, 10)
            @group = create(:group)
            @members = @users.shuffle.take(4)
            @selected = @users.shuffle.take(4)
            @members.each do |usr|
              create(:membership, user: usr, group: @group)
            end
          end
          let(:group) { @group.id }
          let(:users) { @selected.map(&:id) }

          example_request "XLSX export all users by filtering on both group and user ids", document: false do
            expect(status).to eq 200
            xlsx_hash = XlsxService.new.xlsx_to_hash_array  RubyXL::Parser.parse_buffer(response_body).stream
            expect(xlsx_hash.map{|r| r['id']}).to match_array (@members.map(&:id) & @selected.map(&:id))
          end
        end
      end
    end

    get "web_api/v1/users" do
      with_options scope: :page do
        parameter :number, "Page number"
        parameter :size, "Number of users per page"
      end
      example "Get all users as non-admin", document: false do
        do_request
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 1
      end
    end

    get "web_api/v1/users/:id" do
      let(:id) { @user.id }

      example_request "Get one user by id" do
        do_request
        expect(status).to eq 200
      end
    end

    get "web_api/v1/users/:id" do
      let(:id) { @user.id }

      example_request "Get the authenticated user exposes the email field", document: false do
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :email)).to eq @user.email
      end
    end

    get "web_api/v1/users/by_slug/:slug" do
      let(:slug) { @users.first.slug }

      example_request "Get one user by slug" do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq @users.first.id
      end

      describe do
        let(:slug) { "unexisting-user" }

        example "[error] Get an unexisting user by slug", document: false do
          do_request
          expect(status).to eq 404
        end
      end
    end

    get "web_api/v1/users/by_invite/:token" do
      let!(:invite) { create(:invite) }
      let(:token) { invite.token }

      example_request "Get a user by invite" do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq invite.invitee.id
      end

      describe do
        let(:token) { "n0ns3ns3" }

        example "[error] Get an unexisting user by invite token", document: false do
          do_request
          expect(status).to eq 404
        end
      end
    end

    get "web_api/v1/users/me" do
      example_request "Get the authenticated user" do
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq(@user.id)
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
        end
      end
    end

    put "web_api/v1/users/:id" do
      with_options scope: 'user' do
        parameter :first_name, "User full name"
        parameter :last_name, "User full name"
        parameter :email, "E-mail address"
        parameter :password, "Password"
        parameter :locale, "Locale. Should be one of the tenants locales"
        parameter :avatar, "Base64 encoded avatar image"
        parameter :roles, "Roles array, only allowed when admin"
        parameter :bio_multiloc, "A little text, allowing the user to describe herself. Multiloc and non-html"
        parameter :custom_field_values, "An object that can only contain keys for custom fields for users"
      end
      ValidationErrorHelper.new.error_fields(self, User)

      let(:id) { @user.id }
      let(:first_name) { "Edmond" }

      example_request "Update a user" do
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :first_name)).to eq "Edmond"
      end

      describe do
        example "Update a user's custom field values" do
          cf = create(:custom_field)
          do_request(user: {custom_field_values: {cf.key => "somevalue"}})
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :attributes, :custom_field_values, cf.key.to_sym)).to eq "somevalue"
        end
      end
    end

    post "web_api/v1/users/complete_registration" do
      with_options scope: :user do
        parameter :custom_field_values, "An object that can only contain keys for custom fields for users", required: true
      end

      let(:cf) { create(:custom_field )}
      let(:custom_field_values) {{cf.key => "somevalue" }}

      example "Complete the registration of a user" do
        @user.update(registration_completed_at: nil)
        do_request
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :registration_completed_at)).to be_present
        expect(json_response.dig(:data, :attributes, :custom_field_values, cf.key.to_sym)).to eq "somevalue"
      end

      example "[error] Complete the registration of a user fails if not all required fields are provided" do
        @user.update(registration_completed_at: nil)
        cf.update(required: true)
        do_request(user: {custom_field_values: {cf.key => nil}})
        expect(response_status).to eq 422
      end

      example "[error] Complete the registration of a user fails if the user has already completed signup" do
        do_request
        expect(response_status).to eq 401
      end
    end

    delete "web_api/v1/users/:id" do
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
