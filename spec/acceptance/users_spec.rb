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

        example "List all users who can moderate a project" do
          p = create(:project)
          a = create(:admin)
          m1 = create(:moderator, project: p)
          m2 = create(:moderator)
          u = create(:user)
          i = create(:idea, project: p) # a participant, just in case

          do_request(can_moderate_project: p.id)
          json_response = json_parse(response_body)
          expect(json_response[:data].map{|u| u[:id]}).to match_array [a.id,m1.id,@user.id]
        end

        example "List all users who can moderate" do
          p = create(:project)
          a = create(:admin)
          m1 = create(:moderator, project: p)
          m2 = create(:moderator)
          u = create(:user)

          do_request(can_moderate: true)
          json_response = json_parse(response_body)
          expect(json_response[:data].map{|u| u[:id]}).to match_array [a.id,m1.id,m2.id,@user.id]
        end

        example "List all admins" do
          p = create(:project)
          a = create(:admin)
          m1 = create(:moderator, project: p)
          m2 = create(:moderator)
          u = create(:user)

          do_request(can_admin: true)
          json_response = json_parse(response_body)
          expect(json_response[:data].map{|u| u[:id]}).to match_array [a.id, @user.id]
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
        expect(status).to eq 401
      end
    end

    get "web_api/v1/users/:id" do
      let(:id) { @user.id }

      example_request "Get one user by id" do
        do_request
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :highest_role)).to eq 'user'
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
        expect(json_response.dig(:data, :attributes, :email)).to eq invite.invitee.email
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
        expect(json_response.dig(:data, :attributes, :verified)).to eq false
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

      describe do
        let(:custom_field_values) {{birthyear: 1984}}

        example "Update a user" do
          oldtimers = create(:smart_group, rules: [
            {
              ruleType: 'custom_field_number', 
              customFieldId: create(:custom_field_number, title_multiloc: {'en' => 'Birthyear?'}, key: 'birthyear', code: 'birthyear').id,
              predicate: 'is_smaller_than_or_equal', 
              value: 1988
            }
          ])
          project = create(:continuous_project, with_permissions: true)
          granted_permission = project.permissions.find_by(action: 'posting_idea')
          granted_permission.update!(permitted_by: 'groups', groups: [oldtimers])
          do_request
          expect(response_status).to eq 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :attributes, :first_name)).to eq "Edmond"
          expect(json_response.dig(:data, :relationships, :granted_permissions, :data).size).to eq 1
          expect(json_response.dig(:included).select{|i| i[:type] == 'permission'}.first&.dig(:attributes, :permitted_by)).to eq 'groups'
          expect(json_response.dig(:included).select{|i| i[:type] == 'project'}.first&.dig(:attributes, :slug)).to eq project.slug
        end
      end

      describe do
        before do
          @user = create(:admin)
          token = Knock::AuthToken.new(payload: @user.to_token_payload).token
          header 'Authorization', "Bearer #{token}"
        end
        let(:mortal_user) { create(:user) }
        let(:id) { mortal_user.id }
        let(:roles) { [type: 'admin'] }

        example_request "Make a user admin, as an admin" do
          expect(response_status).to eq 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :id)).to eq id
          expect(json_response.dig(:data, :attributes, :roles)).to eq [{type: 'admin'}]
        end
      end

      describe do
        before do
          @user = create(:admin)
          token = Knock::AuthToken.new(payload: @user.to_token_payload).token
          header 'Authorization', "Bearer #{token}"
        end
        let(:assignee) { create(:admin) }
        let!(:assigned_idea) { create(:idea, assignee: assignee) }
        let!(:assigned_initiative) { create(:initiative, assignee: assignee) }
        let(:id) { assignee.id }
        let(:roles) { [] }

        example_request "Remove user as assignee when losing admin rights" do
          expect(response_status).to eq 200
          expect(assignee.reload.admin?).to be_falsey
          expect(assigned_idea.reload.assignee_id).not_to eq id
          expect(assigned_initiative.reload.assignee_id).not_to eq id
        end
      end

      describe do
        example "Update a user's custom field values" do
          cf = create(:custom_field)
          do_request(user: {custom_field_values: {cf.key => "somevalue"}})
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :attributes, :custom_field_values, cf.key.to_sym)).to eq "somevalue"
        end

        example "Clear out a user's custom field value" do
          cf = create(:custom_field)
          @user.update!(custom_field_values: {cf.key => "somevalue"})

          do_request(user: {custom_field_values: {}})
          expect(response_status).to eq 200
          expect(@user.reload.custom_field_values).to eq ({})
        end

        example "Cannot modify values of hidden custom fields" do
          cf = create(:custom_field, hidden: true, enabled: true)
          some_value = "some_value"
          @user.update!(custom_field_values: { cf.key => some_value })

          do_request(user: {custom_field_values: {cf.key => "another_value"}})
          json_response = json_parse(response_body)

          expect(json_response.dig(:data, :attributes, :custom_field_values)).not_to include(cf.key.to_sym)
          expect(@user.custom_field_values[cf.key]).to eq(some_value)
        end

        example "Cannot modify values of disabled custom fields" do
          cf = create(:custom_field, hidden: false, enabled: false)
          some_value = "some_value"
          @user.update!(custom_field_values: {cf.key => some_value})

          do_request(user: {custom_field_values: {cf.key => "another_value"}})
          json_response = json_parse(response_body)

          expect(json_response.dig(:data, :attributes, :custom_field_values)).not_to include(cf.key.to_sym)
          expect(@user.custom_field_values[cf.key]).to eq(some_value)
        end
      end

      describe do
        example "The user avatar can be removed" do
          @user.update(avatar: Rails.root.join("spec/fixtures/male_avatar_1.jpg").open)
          expect(@user.reload.avatar_url).to be_present
          do_request user: {avatar: nil}
          expect(@user.reload.avatar_url).to be nil
        end
      end

      describe do
        let(:cf) { create(:custom_field) }
        let(:birthyear_cf) { create(:birthyear_custom_field) }
        let(:custom_field_values) {{
          cf.key => "new value",
          birthyear_cf.key => 1969,
        }}
        let(:first_name) { 'Raymond' }
        let(:last_name) { 'Betancourt' }
        let(:email) { 'ray.mond@rocks.com' }
        let(:locale) { 'fr-FR' }

        example "Can't change some attributes of a user verified with FranceConnect", document: false do
          create(:verification, method_name: 'franceconnect', user: @user)
          @user.update(custom_field_values: {cf.key => "original value", birthyear_cf.key => 1950})
          do_request
          expect(response_status).to eq 200
          @user.reload
          expect(@user.first_name).not_to eq first_name
          expect(@user.last_name).not_to eq last_name
          expect(@user.email).to eq email
          expect(@user.locale).to eq locale
          expect(@user.custom_field_values[cf.key]).to eq "new value"
          expect(@user.custom_field_values[birthyear_cf.key]).to eq 1950
        end
      end

    end



    post "web_api/v1/users/complete_registration" do
      with_options scope: :user do
        parameter :custom_field_values, "An object that can only contain keys for custom fields for users", required: true
      end

      let(:cf1) { create(:custom_field ) }
      let(:cf2) { create(:custom_field_multiselect, required: true ) }
      let(:cf2_options) { create_list(:custom_field_option, 2, custom_field: cf2) }
      let(:custom_field_values) {{ cf1.key => "somevalue", cf2.key => [cf2_options.first.key] }}

      example "Complete the registration of a user" do
        @user.update(registration_completed_at: nil)
        do_request
        expect(response_status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :registration_completed_at)).to be_present
        expect(json_response.dig(:data, :attributes, :custom_field_values, cf1.key.to_sym)).to eq "somevalue"
        expect(json_response.dig(:data, :attributes, :custom_field_values, cf2.key.to_sym)).to eq [cf2_options.first.key]
      end

      example "[error] Complete the registration of a user fails if not all required fields are provided" do
        @user.update(registration_completed_at: nil)
        do_request(user: {custom_field_values: {cf2.key => nil}})
        expect(response_status).to eq 422
      end

      example "[error] Complete the registration of a user fails if the user has already completed signup" do
        do_request
        expect(response_status).to eq 401
      end

      describe do
        let(:cf) { create(:custom_field) }
        let(:birthyear_cf) { create(:birthyear_custom_field) }

        let(:custom_field_values) {{
          cf.key => "new value",
          birthyear_cf.key => 1969,
        }}
        example "Can't change some custom_field_values of a user verified with FranceConnect", document: false do
          @user.update(
            registration_completed_at: nil,
            custom_field_values: {cf.key => "original value", birthyear_cf.key => 1950}
          )
          create(:verification, method_name: 'franceconnect', user: @user)
          do_request
          expect(response_status).to eq 200
          @user.reload
          expect(@user.custom_field_values[cf.key]).to eq "new value"
          expect(@user.custom_field_values[birthyear_cf.key]).to eq 1950
        end
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

    get "web_api/v1/users/:id/ideas_count" do
      let(:id) { @user.id }

      example "Get the number of ideas published by one user" do
        create(:idea, author: @user)
        create(:idea)
        create(:idea, author: @user, publication_status: 'draft')
        do_request
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:count)).to eq 1
      end
    end

    get "web_api/v1/users/:id/initiatives_count" do
      let(:id) { @user.id }

      example "Get the number of initiatives published by one user" do
        create(:initiative, author: @user)
        create(:initiative)
        create(:initiative, author: @user, publication_status: 'draft')
        do_request
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:count)).to eq 1
      end
    end

    get "web_api/v1/users/:id/comments_count" do
      parameter :post_type, "Count only comments of one post type. Either 'Idea' or 'Initiative'.", required: false

      let(:id) { @user.id }

      example "Get the number of comments posted by one user" do
        create(:comment, author: @user, post: create(:initiative))
        create(:comment)
        create(:comment, author: @user, post: create(:idea))
        create(:comment, author: @user, publication_status: 'deleted')
        do_request
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:count)).to eq 2
      end

      example "Get the number of comments on ideas posted by one user" do
        create(:comment, author: @user, post: create(:initiative))
        create(:comment, post: create(:initiative))
        create(:comment, author: @user, post: create(:idea))
        create(:comment, author: @user, post: create(:idea))
        create(:comment, author: @user, publication_status: 'deleted', post: create(:idea))
        do_request post_type: 'Idea'
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:count)).to eq 2
      end

      example "Get the number of comments on initiatives posted by one user" do
        create(:comment, author: @user, post: create(:initiative))
        create(:comment, author: @user, post: create(:initiative))
        create(:comment, post: create(:idea))
        create(:comment, author: @user, post: create(:idea))
        create(:comment, author: @user, publication_status: 'deleted', post: create(:initiative))
        do_request post_type: 'Initiative'
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:count)).to eq 2
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
