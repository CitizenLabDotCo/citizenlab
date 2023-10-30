# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Users' do
  explanation 'Citizens and city administrators.'

  before do
    header 'Content-Type', 'application/json'
  end

  context 'when not authenticated' do
    get 'web_api/v1/users/me' do
      example_request '[error] Get the authenticated user' do
        assert_status 401
      end
    end

    get 'web_api/v1/users' do
      with_options scope: :page do
        parameter :number, 'Page number'
        parameter :size, 'Number of users per page'
      end
      parameter :search, 'Filter by searching in first_name, last_name and email', required: false
      parameter :sort, "Sort user by 'created_at', '-created_at', 'last_name', '-last_name', 'email', " \
                       "'-email', 'role', '-role'", required: false
      parameter :group, 'Filter by group_id', required: false
      parameter :can_moderate, 'Return only admins and moderators', required: false
      parameter :can_admin, 'Return only admins', required: false
      parameter :can_moderate_project, 'All admins + users who can moderate the project (by project id), ' \
                                       'excluding folder moderators of folder containing project ' \
                                       '(who can, in fact, moderate the project), ' \
                                       'OR All admins + users with project moderator role ' \
                                       '(if no project ID provided)', required: false
      parameter :is_not_project_moderator, 'Users who are not project moderators of project, ' \
                                           'nor folder moderator of folder containing project (by project id), ' \
                                           'OR Users who do not have project moderator role ' \
                                           '(if no project ID provided)', required: false
      parameter :is_not_folder_moderator, 'Users who are not folder moderators of folder (by folder id), ' \
                                          'OR Users who do not have folder moderator role ' \
                                          '(if no folder ID provided)', required: false
      example_request '[error] List all users' do
        assert_status 401
      end
    end

    get 'web_api/v1/users/as_xlsx' do
      parameter :group, 'Filter by group_id', required: false
      parameter :users, 'Filter out only users with the provided user ids', required: false

      example_request '[error] XLSX export' do
        assert_status 401
      end
    end

    get 'web_api/v1/users/:id' do
      before do
        @user = create(:user)
      end

      let(:id) { @user.id }
      example 'Get a non-authenticated user does not expose the email', document: false do
        do_request

        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :attributes, :email)).to be_nil
      end
    end

    get 'web_api/v1/users/check/:email' do
      let(:email) { 'test@test.com' }

      context 'when a user does not exist' do
        example_request 'Returns "terms"' do
          assert_status 200
          expect(json_response_body[:data][:attributes][:action]).to eq('terms')
        end
      end

      context 'when a user exists without a password and has completed registration', document: false do
        before { create(:user_no_password, email: 'test@test.com', registration_completed_at: Time.now) }

        example_request 'Returns "confirm"' do
          assert_status 200
          expect(json_response_body[:data][:attributes][:action]).to eq('confirm')
        end
      end

      context 'when a user exists with a password', document: false do
        before { create(:user, email: 'test@test.com') }

        example_request 'Returns "password"' do
          assert_status 200
          expect(json_response_body[:data][:attributes][:action]).to eq('password')
        end
      end

      context 'when an invalid email is used', document: false do
        let(:email) { 'test_test.com' }

        example_request '[error] Invalid email' do
          assert_status 422
          expect(json_response_body.dig(:errors, :email, 0, :error)).to eq('invalid')
        end
      end

      context 'when an email used by a pending invite is used', document: false do
        before { create(:invited_user, email: 'test@test.com') }

        example_request '[error] Taken by invite' do
          assert_status 422
          expect(json_response_body.dig(:errors, :email, 0, :error)).to eq('taken_by_invite')
        end
      end
    end

    post 'web_api/v1/users' do
      before do
        settings = AppConfiguration.instance.settings
        settings['password_login'] = {
          'allowed' => true,
          'enabled' => true,
          'enable_signup' => true,
          'phone' => true,
          'phone_email_pattern' => 'phone+__PHONE__@test.com',
          'minimum_length' => 6
        }
        AppConfiguration.instance.update!(settings: settings)
      end

      with_options scope: 'user' do
        parameter :first_name, 'User full name', required: false
        parameter :last_name, 'User full name', required: false
        parameter :email, 'E-mail address', required: true
        parameter :password, 'Password', required: false
        parameter :locale, 'Locale. Should be one of the tenants locales', required: true
        parameter :avatar, 'Base64 encoded avatar image'
        parameter :roles, 'Roles array, only allowed when admin'
        parameter :custom_field_values, 'An object that can only contain keys for custom fields for users. If fields are required, their presence is required as well'
      end
      ValidationErrorHelper.new.error_fields(self, User)

      context 'full registration with a password' do
        let(:first_name) { Faker::Name.first_name }
        let(:last_name) { Faker::Name.last_name }
        let(:email) { Faker::Internet.email }
        let(:password) { Faker::Internet.password }
        let(:locale) { 'en' }
        let(:avatar) { png_image_as_base64 'lorem-ipsum.jpg' }

        example_request 'Create a user' do
          assert_status 201
        end

        context 'when the user_confirmation module is active' do
          before do
            allow(RequestConfirmationCodeJob).to receive(:perform_now)
            SettingsService.new.activate_feature! 'user_confirmation'
          end

          example_request 'Registration is not completed by default' do
            assert_status 201
            json_response = json_parse(response_body)
            expect(json_response.dig(:data, :attributes, :registration_completed_at)).to be_nil # when no custom fields
          end

          example_request 'Requires confirmation' do
            assert_status 201
            json_response = json_parse(response_body)
            user = User.order(:created_at).last
            expect(RequestConfirmationCodeJob).to have_received(:perform_now).with(user).once
            expect(json_response.dig(:data, :attributes, :confirmation_required)).to be true # when no custom fields
          end
        end

        describe 'Creating an admin user' do
          before do
            settings = AppConfiguration.instance.settings
            settings['password_login'] = {
              'enabled' => true,
              'allowed' => true,
              'enable_signup' => true,
              'minimum_length' => 5,
              'phone' => false
            }
            AppConfiguration.instance.update! settings: settings
          end

          let(:roles) { [{ type: 'admin' }] }

          example 'creates a user, but not an admin', document: false do
            create(:admin) # there must be at least on admin, otherwise the next user will automatically be made an admin
            do_request
            assert_status 201
            json_response = json_parse(response_body)
            expect(json_response.dig(:data, :attributes, :roles)).to be_empty
          end
        end

        describe 'invalid user errors' do
          before do
            settings = AppConfiguration.instance.settings
            settings['password_login'] = {
              'enabled' => true,
              'allowed' => true,
              'enable_signup' => true,
              'minimum_length' => 5,
              'phone' => false
            }
            AppConfiguration.instance.update! settings: settings
          end

          let(:password) { 'ab' }

          example '[error] Create an invalid user', document: false do
            do_request
            assert_status 422
            json_response = json_parse response_body
            expect(json_response).to include_response_error(:password, 'too_short', count: 5)
          end
        end

        describe 'invited user creation error' do
          let!(:invitee) { create(:invited_user) }
          let(:email) { invitee.email }

          example_request '[error] Registering an invited user' do
            assert_status 422
            json_response = json_parse response_body
            expect(json_response).to include_response_error(
              :email,
              'taken_by_invite',
              value: email,
              inviter_email: invitee.invitee_invite.inviter.email
            )
          end
        end

        describe 'case insensitive email error' do
          before do
            create(:user, email: 'JeZuS@citizenlab.co')
          end

          let(:email) { 'jEzUs@citizenlab.co' }

          example '[error] Registering a user with case insensitive email duplicate', document: false do
            do_request
            assert_status 422
          end
        end

        context 'with phone password_login turned on' do
          before do
            settings = AppConfiguration.instance.settings
            settings['password_login'] = {
              'allowed' => true,
              'enabled' => true,
              'enable_signup' => true,
              'phone' => true,
              'phone_email_pattern' => 'phone+__PHONE__@test.com',
              'minimum_length' => 6
            }
            AppConfiguration.instance.update!(settings: settings)
          end

          describe 'email registration' do
            let(:email) { 'someone@citizenlab.co' }

            example 'Register with email when an email is passed', document: false do
              do_request
              assert_status 201
              expect(User.find_by(email: email)).to be_present
            end
          end

          describe 'phone registration' do
            let(:email) { '+32 487 36 58 98' }

            example 'Registers a user with a phone number in the email when a phone number is passed', document: false do
              do_request
              assert_status 201
              expect(User.find_by(email: 'phone+32487365898@test.com')).to be_present
            end
          end
        end
      end

      context 'light registration without a password' do
        let(:email) { Faker::Internet.email }
        let(:locale) { 'en' }

        before do
          allow(RequestConfirmationCodeJob).to receive(:perform_now)
          SettingsService.new.activate_feature! 'user_confirmation'
        end

        describe 'create a user with no password' do
          example_request 'User successfully created and requires confirmation' do
            assert_status 201
            user = User.order(:created_at).last
            expect(RequestConfirmationCodeJob).to have_received(:perform_now).with(user).once
            expect(response_data.dig(:attributes, :confirmation_required)).to be(true)
          end

          example_request 'Registration is not completed by default' do
            assert_status 201
            expect(response_data.dig(:attributes, :registration_completed_at)).to be_nil
          end
        end

        describe 'Reusing an existing user with no password' do
          context 'when there is an existing user that has no password' do
            example 'existing confirmed user is successfully returned, confirmation requirement is reset and email sent' do
              existing_user = create(:user_no_password, email: email)
              existing_user.confirm!

              do_request
              assert_status 200
              expect(response_data.dig(:attributes, :confirmation_required)).to be(true)
              expect(RequestConfirmationCodeJob).to have_received(:perform_now).with(existing_user).once
            end

            context 'when the request tries to pass additional changed attributes', document: false do
              let(:first_name) { Faker::Name.first_name }

              example 'email taken error is returned and confirmation requirement is not reset' do
                existing_user = create(:user_no_password, email: email)
                existing_user.confirm!

                do_request
                assert_status 422
                expect(json_response_body.dig(:errors, :email, 0, :error)).to eq('taken')
                expect(existing_user.confirmation_required?).to be(false)
              end
            end
          end

          context 'when there is an existing user WITH a password' do
            example 'email taken error is returned and confirmation requirement is not reset' do
              existing_user = create(:user, email: email, password: 'gravy123')

              do_request
              assert_status 422
              expect(json_response_body.dig(:errors, :email, 0, :error)).to eq('taken')
              expect(existing_user.confirmation_required?).to be(false)
            end
          end
        end
      end
    end
  end

  context 'when authenticated' do
    before do
      @user = create(:user, last_name: 'Smith')
      header_token_for @user
    end

    context 'when admin' do
      before do
        @user.update!(roles: [{ type: 'admin' }])
        %w[Bednar Cole Hagenes MacGyver Oberbrunner].map { |l| create(:user, last_name: l) }
      end

      get 'web_api/v1/users' do
        with_options scope: :page do
          parameter :number, 'Page number'
          parameter :size, 'Number of users per page'
        end
        parameter :search, 'Filter by searching in first_name, last_name and email', required: false
        parameter :sort, "Sort user by 'created_at', '-created_at', 'last_name', '-last_name', 'email', '-email', 'role', '-role'", required: false
        parameter :group, 'Filter by group_id', required: false
        parameter :can_moderate_project, 'Filter by users (and admins) who can moderate the project (by id)', required: false
        parameter :can_moderate, 'Return only admins and moderators', required: false
        parameter :can_admin, 'Return only admins', required: false
        parameter :blocked, 'Return only blocked users', required: false

        example_request 'List all users' do
          expect(status).to eq 200
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 6
        end

        example 'List all users includes user blocking related data', document: false do
          do_request
          expect(status).to eq 200
          json_response = json_parse(response_body)
          expect(json_response[:data][0][:attributes]).to have_key(:blocked)
          expect(json_response[:data][0][:attributes]).to have_key(:block_start_at)
          expect(json_response[:data][0][:attributes]).to have_key(:block_end_at)
          expect(json_response[:data][0][:attributes]).to have_key(:block_reason)
        end

        example 'Get all users on the second page with fixed page size' do
          do_request({ 'page[number]' => 2, 'page[size]' => 2 })
          expect(status).to eq 200
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 2
        end

        example 'Search for users' do
          users = [
            create(:user, first_name: 'Joskelala'),
            create(:user, last_name: 'Rudolf')
          ]

          do_request search: 'joskela'
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 1
          expect(json_response[:data][0][:id]).to eq users[0].id
        end

        example 'Search for users with sort parameter', document: false do
          users = [
            create(:user, first_name: 'Joskelala'),
            create(:user, last_name: 'Rudolf')
          ]

          do_request search: 'joskela', sort: 'role'
          json_response = json_parse(response_body)
          expect(json_response[:data].size).to eq 1
          expect(json_response[:data][0][:id]).to eq users[0].id
        end

        example 'List all users sorted by last_name' do
          do_request sort: 'last_name'

          assert_status 200
          json_response = json_parse(response_body)

          sorted_last_names = User.pluck(:last_name).sort
          expect(json_response[:data].map { |u| u.dig(:attributes, :last_name) }).to eq sorted_last_names
        end

        example 'List all users in group' do
          group = create(:group)
          group_users = create_list(:user, 3, manual_groups: [group])

          do_request(group: group.id)
          json_response = json_parse(response_body)

          expect(json_response[:data].size).to eq 3
          expect(json_response[:data].pluck(:id)).to match_array group_users.map(&:id)
        end

        example 'Search for users in group' do
          group = create(:group)

          group_users = [
            create(:user, first_name: 'Joskelala', manual_groups: [group]),
            create(:user, last_name: 'Rudolf', manual_groups: [group])
          ]

          do_request(group: group.id, search: 'joskela')
          json_response = json_parse(response_body)

          expect(json_response[:data].size).to eq 1
          expect(json_response[:data][0][:id]).to eq group_users[0].id
        end

        example 'List all users in group, ordered by role' do
          group = create(:group)

          admin = create(:admin, manual_groups: [group])
          moderator = create(:project_moderator, manual_groups: [group])
          both = create(:project_moderator, manual_groups: [group])
          both.add_role('admin').save!

          group_users = [admin, both, moderator] + create_list(:user, 3, manual_groups: [group])

          do_request(group: group.id, sort: '-role')
          json_response = json_parse(response_body)

          aggregate_failures 'testing json response' do
            expect(json_response[:data].size).to eq 6
            expect(json_response[:data].pluck(:id)).to match_array group_users.map(&:id)
            expect(json_response[:data].pluck(:id).reverse.take(2)).to match_array [admin.id, both.id]
          end
        end

        describe 'List all users in group' do
          example 'with correct pagination', document: false do
            page_size = 5
            project = create(:project)
            group = create(
              :smart_group,
              rules: [
                { ruleType: 'participated_in_project', predicate: 'in', value: [project.id] }
              ]
            )
            Array.new(page_size + 1) do |_i|
              create(:idea, project: project, author: create(:user))
            end

            do_request(group: group.id, page: { number: 1, size: page_size })
            json_response = json_parse(response_body)

            expect(json_response[:links][:next]).to be_present
          end
        end

        describe 'Not moderator filters' do
          before do
            @user                       = create(:user)
            @admin                      = create(:admin)
            @project                    = create(:project)
            @project_folder             = create(:project_folder, projects: [@project])
            @project_moderator          = create(:project_moderator, projects: [@project])
            @moderator_of_other_project = create(:project_moderator, projects: [create(:project)])
            @project_folder_moderator   = create(:project_folder_moderator, project_folders: [@project_folder])
            @moderator_of_other_folder  = create(:project_folder_moderator, project_folders: [create(:project_folder)])
          end

          example 'List only users who cannot moderate a specific project' do
            do_request is_not_project_moderator: @project.id
            expect(status).to eq 200

            user_ids = json_parse(response_body)[:data].pluck(:id)
            expect(user_ids).to include(@user.id, @moderator_of_other_project.id, @moderator_of_other_folder.id)
            expect(user_ids).not_to include(@project_moderator.id, @project_folder_moderator.id)
          end

          example 'List only users who cannot moderate a specific folder' do
            do_request is_not_folder_moderator: @project_folder.id
            expect(status).to eq 200

            user_ids = json_parse(response_body)[:data].pluck(:id)
            expect(user_ids).to include(
              @user.id, @project_moderator.id, @moderator_of_other_project.id, @moderator_of_other_folder.id
            )
            expect(user_ids).not_to include(@project_folder_moderator.id)
          end
        end

        example 'List all users who can moderate a project' do
          p = create(:project)
          a = create(:admin)
          m1 = create(:project_moderator, projects: [p])

          create(:project_moderator)
          create(:user)
          create(:idea, project: p) # a participant, just in case

          do_request(can_moderate_project: p.id)
          json_response = json_parse(response_body)
          expect(json_response[:data].pluck(:id)).to match_array [a.id, m1.id, @user.id]
        end

        example 'List all users who can moderate' do
          p = create(:project)
          a = create(:admin)
          m1 = create(:project_moderator, projects: [p])
          m2 = create(:project_moderator)
          create(:user)

          do_request(can_moderate: true)
          json_response = json_parse(response_body)
          expect(json_response[:data].pluck(:id)).to match_array [a.id, m1.id, m2.id, @user.id]
        end

        example 'List all admins' do
          p = create(:project)
          a = create(:admin)
          create(:user)
          create(:project_moderator, projects: [p])
          create(:project_moderator)

          do_request(can_admin: true)
          json_response = json_parse(response_body)
          expect(json_response[:data].pluck(:id)).to match_array [a.id, @user.id]
        end
      end

      get 'web_api/v1/users/seats' do
        before do
          create(:super_admin) # super admin are not included in admins

          @admins = [@user, *create_list(:admin, 3)]

          folder_moderators = create_list(:project_folder_moderator, 2, project_folders: [create(:project_folder)])
          project_moderators = create_list(:project_moderator, 4, projects: [create(:project)])
          @moderators = [*folder_moderators, *project_moderators]
        end

        example_request 'Get number of admin and manager (moderator) seats' do
          expect(status).to eq 200
          expect(response_data[:type]).to eq 'seats'
          attributes = response_data[:attributes]
          expect(attributes[:admins_number]).to eq @admins.size
          expect(attributes[:moderators_number]).to eq @moderators.size
        end
      end

      get 'web_api/v1/users/as_xlsx' do
        parameter :group, 'Filter by group_id', required: false
        parameter :users, 'Filter out only users with the provided user ids', required: false

        example_request 'XLSX export' do
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

          example_request 'XLSX export all users from a group' do
            expect(status).to eq 200
            xlsx_hash = XlsxService.new.xlsx_to_hash_array RubyXL::Parser.parse_buffer(response_body).stream
            expect(xlsx_hash.pluck('id')).to match_array @members.map(&:id)
          end
        end

        describe do
          before do
            @users = create_list(:user, 10)
            @group = create(:group)
            @selected = @users.shuffle.take(4)
          end

          let(:users) { @selected.map(&:id) }

          example_request 'XLSX export all users given a list of user ids' do
            expect(status).to eq 200
            xlsx_hash = XlsxService.new.xlsx_to_hash_array RubyXL::Parser.parse_buffer(response_body).stream
            expect(xlsx_hash.pluck('id')).to match_array @selected.map(&:id)
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

          example 'XLSX export all users by filtering on both group and user ids', document: false do
            do_request
            expect(status).to eq 200
            xlsx_hash = XlsxService.new.xlsx_to_hash_array RubyXL::Parser.parse_buffer(response_body).stream
            expect(xlsx_hash.pluck('id')).to match_array(@members.map(&:id) & @selected.map(&:id))
          end
        end
      end

      get 'web_api/v1/users/by_slug/:slug' do
        let(:user) { create(:user) }
        let(:slug) { user.slug }

        example_request 'Get one user by slug includes user block data' do
          expect(status).to eq 200
          json_response = json_parse response_body
          expect(json_response.dig(:data, :attributes)).to have_key(:blocked)
          expect(json_response.dig(:data, :attributes)).to have_key(:block_start_at)
          expect(json_response.dig(:data, :attributes)).to have_key(:block_end_at)
          expect(json_response.dig(:data, :attributes)).to have_key(:block_reason)
        end
      end

      get 'web_api/v1/users/:id' do
        let(:user) { create(:user) }
        let(:id) { user.id }

        example 'Get a user by ID' do
          create_list(:follower, 2, user: user)
          create(:follower)

          do_request

          assert_status 200
          json_response = json_parse response_body
          expect(json_response.dig(:data, :attributes)).to have_key(:blocked)
          expect(json_response.dig(:data, :attributes)).to have_key(:block_start_at)
          expect(json_response.dig(:data, :attributes)).to have_key(:block_end_at)
          expect(json_response.dig(:data, :attributes)).to have_key(:block_reason)
          expect(json_response.dig(:data, :attributes, :followings_count)).to eq 2
        end
      end

      get 'web_api/v1/users/blocked_count' do
        example 'Get count of blocked users' do
          create_list(:user, 2, block_end_at: 5.days.from_now)

          do_request

          expect(status).to eq 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :attributes, :count)).to eq 2
        end
      end

      patch 'web_api/v1/users/:id/block' do
        before do
          settings = AppConfiguration.instance.settings
          settings['user_blocking'] = { 'enabled' => true, 'allowed' => true, 'duration' => 90 }
          AppConfiguration.instance.update!(settings: settings)
        end

        with_options scope: 'user' do
          parameter :block_reason, 'Reason for blocking & any additional information', required: false
        end
        ValidationErrorHelper.new.error_fields(self, User)

        let!(:user) { create(:user) }
        let!(:id) { user.id }

        example 'Block a user using a null value for block_reason' do
          do_request user: { block_reason: nil }

          expect(status).to eq 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :attributes, :blocked)).to be true
        end

        example 'Block a user and provide a reason' do
          do_request user: { block_reason: 'reason' }

          expect(status).to eq 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :attributes, :blocked)).to be true
        end
      end

      patch 'web_api/v1/users/:id/unblock' do
        let!(:user) { create(:user, block_end_at: 5.days.from_now) }
        let!(:id) { user.id }

        example 'unblock a user' do
          do_request

          expect(status).to eq 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :attributes, :blocked)).to be false
        end
      end

      patch 'web_api/v1/users/:id' do
        with_options scope: 'user' do
          parameter :first_name, 'User full name'
          parameter :last_name, 'User full name'
          parameter :email, 'E-mail address. Can only be changed directly when user confirmation is turned off.'
          parameter :password, 'Password'
          parameter :locale, 'Locale. Should be one of the tenants locales'
          parameter :avatar, 'Base64 encoded avatar image'
          parameter :roles, 'Roles array, only allowed when admin'
          parameter :bio_multiloc, 'A little text, allowing the user to describe herself. Multiloc and non-html'
          parameter :custom_field_values, 'An object that can only contain keys for custom fields for users'
        end
        ValidationErrorHelper.new.error_fields(self, User)

        let(:id) { @user.id }
        let(:first_name) { 'Edmond' }

        describe do
          let(:custom_field_values) { { birthyear: 1984 } }
          let(:project) { create(:continuous_project, with_permissions: true) }

          before do
            old_timers = create(:smart_group, rules: [
              {
                ruleType: 'custom_field_number',
                customFieldId: create(:custom_field_number, title_multiloc: { 'en' => 'Birthyear?' }, key: 'birthyear', code: 'birthyear').id,
                predicate: 'is_smaller_than_or_equal',
                value: 1988
              }
            ])

            project.permissions.find_by(action: 'posting_idea')
              .update!(permitted_by: 'groups', groups: [old_timers])
          end

          context 'on a resident' do
            let(:resident) { create(:user, email: 'original@email.com') }
            let(:id) { resident.id }
            let(:roles) { [type: 'admin'] }

            example_request 'Make the user (resident) admin' do
              assert_status 200
              json_response = json_parse response_body
              expect(json_response.dig(:data, :id)).to eq id
              expect(json_response.dig(:data, :attributes, :roles)).to eq [{ type: 'admin' }]
            end

            context 'with limited seats' do
              before do
                config = AppConfiguration.instance
                config.settings['core']['maximum_admins_number'] = 2
                config.settings['core']['additional_admins_number'] = 0
                config.settings['seat_based_billing'] = { enabled: true, allowed: true }
                config.save!
              end

              context 'when limit is reached' do
                before { create(:admin) } # to reach limit of 2

                example 'Increments additional seats', document: false do
                  do_request
                  assert_status 200
                  expect(AppConfiguration.instance.settings['core']['additional_admins_number']).to eq(1)
                end
              end

              example 'Does not increment additional seats if limit is not reached', document: false do
                do_request
                assert_status 200
                expect(AppConfiguration.instance.settings['core']['additional_admins_number']).to eq(0)
              end
            end

            describe 'when confirmation is turned off' do
              before { SettingsService.new.deactivate_feature! 'user_confirmation' }

              example 'Email can be changed', document: false do
                do_request(user: { email: 'changed@email.com' })
                assert_status 200
                expect(resident.reload.email).to eq 'changed@email.com'
              end
            end

            describe 'when confirmation is turned on' do
              before { SettingsService.new.activate_feature! 'user_confirmation' }

              example 'Email cannot be changed', document: false do
                do_request(user: { email: 'changed@email.com' })
                expect(resident.reload.email).to eq 'original@email.com'
              end
            end
          end

          context 'on a folder moderator' do
            let(:folder) { create(:project_folder) }
            let(:moderator) { create(:project_folder_moderator, project_folders: [folder]) }
            let(:id) { moderator.id }
            let(:roles) { moderator.roles + [{ 'type' => 'admin' }] }

            example_request 'Make the user (folder moderator) admin' do
              assert_status 200
              json_response = json_parse response_body
              expect(json_response.dig(:data, :id)).to eq id
              expect(json_response.dig(:data, :attributes, :roles)).to include({ type: 'admin' })
            end
          end
        end
      end
    end

    context 'when non-admin' do
      get 'web_api/v1/users' do
        with_options scope: :page do
          parameter :number, 'Page number'
          parameter :size, 'Number of users per page'
        end
        example 'Get all users as non-admin', document: false do
          do_request
          assert_status 401
        end
      end

      get 'web_api/v1/users/seats' do
        example_request '[error] Get number of admin seats when current user is not admin' do
          expect(status).to eq 401
        end
      end

      get 'web_api/v1/users/:id' do
        let(:id) { @user.id }

        example_request 'Get one user by id' do
          do_request
          expect(status).to eq 200
          json_response = json_parse response_body
          expect(json_response.dig(:data, :attributes, :highest_role)).to eq 'user'
        end
      end

      get 'web_api/v1/users/:id' do
        let(:user) { create(:user) }
        let(:id) { user.id }

        example_request 'Get a user by id does not include user block data' do
          expect(status).to eq 200
          json_response = json_parse response_body
          expect(json_response.dig(:data, :attributes)).not_to have_key(:blocked)
          expect(json_response.dig(:data, :attributes)).not_to have_key(:block_start_at)
          expect(json_response.dig(:data, :attributes)).not_to have_key(:block_end_at)
          expect(json_response.dig(:data, :attributes)).not_to have_key(:block_reason)
        end
      end

      get 'web_api/v1/users/:id' do
        let(:id) { @user.id }

        example 'Get the authenticated user exposes the email field', document: false do
          do_request
          json_response = json_parse response_body
          expect(json_response.dig(:data, :attributes, :email)).to eq @user.email
        end
      end

      get 'web_api/v1/users/by_slug/:slug' do
        let(:user) { create(:user) }
        let(:slug) { user.slug }

        example_request 'Get one user by slug' do
          expect(status).to eq 200
          json_response = json_parse response_body
          expect(json_response.dig(:data, :id)).to eq user.id
        end

        example '[error] Get an unexisting user by slug', document: false do
          do_request slug: 'unexisting-user'
          expect(status).to eq 404
        end

        example_request 'Get a user by slug does not include user block data' do
          expect(status).to eq 200
          json_response = json_parse response_body
          expect(json_response.dig(:data, :attributes)).not_to have_key(:blocked)
          expect(json_response.dig(:data, :attributes)).not_to have_key(:block_start_at)
          expect(json_response.dig(:data, :attributes)).not_to have_key(:block_end_at)
          expect(json_response.dig(:data, :attributes)).not_to have_key(:block_reason)
        end
      end

      get 'web_api/v1/users/by_invite/:token' do
        let!(:invite) { create(:invite) }
        let(:token) { invite.token }

        example_request 'Get a user by invite' do
          expect(status).to eq 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :id)).to eq invite.invitee.id
          expect(json_response.dig(:data, :attributes, :email)).to eq invite.invitee.email
        end

        describe do
          let(:token) { 'n0ns3ns3' }

          example '[error] Get an unexisting user by invite token', document: false do
            do_request
            expect(status).to eq 404
          end
        end
      end

      get 'web_api/v1/users/me' do
        example_request 'Get the authenticated user' do
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :id)).to eq(@user.id)
          expect(json_response.dig(:data, :attributes, :verified)).to be false
        end
      end

      get 'web_api/v1/users/blocked_count' do
        example_request 'Get count of blocked users' do
          expect(status).to eq 401
        end
      end

      put 'web_api/v1/users/:id' do
        with_options scope: 'user' do
          parameter :first_name, 'User full name'
          parameter :last_name, 'User full name'
          parameter :email, 'E-mail address'
          parameter :password, 'Password'
          parameter :locale, 'Locale. Should be one of the tenants locales'
          parameter :avatar, 'Base64 encoded avatar image'
          parameter :onboarding, 'Onboarding parameters'
          parameter :roles, 'Roles array, only allowed when admin'
          parameter :bio_multiloc, 'A little text, allowing the user to describe herself. Multiloc and non-html'
          parameter :custom_field_values, 'An object that can only contain keys for custom fields for users'
        end
        ValidationErrorHelper.new.error_fields(self, User)

        let(:id) { @user.id }
        let(:first_name) { 'Edmond' }

        describe do
          let(:custom_field_values) { { birthyear: 1984 } }
          let(:project) { create(:continuous_project) }
          let(:onboarding) { { topics_and_areas: 'satisfied' } }

          example_request 'Update a user' do
            assert_status 200
            expect(response_data.dig(:attributes, :first_name)).to eq first_name
            expect(response_data.dig(:attributes, :onboarding)).to eq onboarding
          end
        end

        describe 'updating the user email' do
          let(:email) { 'new-email@email.com' }

          context 'when the user_confirmation module is active' do
            before do
              SettingsService.new.activate_feature! 'user_confirmation'
            end

            example_request '[error] is not allowed' do
              expect(@user.reload.email).not_to eq(email)
            end
          end

          context 'when the user_confirmation module is not active' do
            example_request 'is allowed' do
              json_response = json_parse(response_body)
              assert_status 200
              expect(json_response.dig(:data, :attributes, :email)).to eq(email)
            end
          end
        end

        describe do
          example "Update a user's custom field values" do
            cf = create(:custom_field)
            do_request(user: { custom_field_values: { cf.key => 'somevalue' } })
            json_response = json_parse(response_body)
            expect(json_response.dig(:data, :attributes, :custom_field_values, cf.key.to_sym)).to eq 'somevalue'
          end

          example "Clear out a user's custom field value" do
            cf = create(:custom_field)
            @user.update!(custom_field_values: { cf.key => 'somevalue' })

            do_request(user: { custom_field_values: {} })
            expect(response_status).to eq 200
            expect(@user.reload.custom_field_values).to eq({})
          end

          example 'Cannot modify values of hidden custom fields' do
            cf = create(:custom_field, hidden: true, enabled: true)
            some_value = 'some_value'
            @user.update!(custom_field_values: { cf.key => some_value })

            do_request(user: { custom_field_values: { cf.key => 'another_value' } })
            json_response = json_parse(response_body)

            expect(json_response.dig(:data, :attributes, :custom_field_values)).not_to include(cf.key.to_sym)
            expect(@user.custom_field_values[cf.key]).to eq(some_value)
          end

          example 'Can modify values of disabled custom fields' do
            cf = create(:custom_field, hidden: false, enabled: false)
            some_value = 'some_value'
            @user.update!(custom_field_values: { cf.key => some_value })

            do_request(user: { custom_field_values: { cf.key => 'another_value' } })
            json_response = json_parse(response_body)

            expect(json_response.dig(:data, :attributes, :custom_field_values)).to include(cf.key.to_sym)
            expect(@user.custom_field_values[cf.key]).to eq(some_value)
          end

          # To allow for custom fields to be required or not depending on the action
          example 'Allow update if custom fields are changed but required fields are not present', document: false do
            cf = create(:custom_field)
            cf_req = create(:custom_field, required: true)

            do_request(user: { custom_field_values: { cf.key => 'some_value' } })
            json_response = json_parse(response_body)

            assert_status 200
            expect(json_response.dig(:data, :attributes, :custom_field_values, cf.key.to_sym)).to eq 'some_value'
            expect(json_response.dig(:data, :attributes, :custom_field_values, cf_req.key.to_sym)).to be_nil
          end
        end

        describe do
          example 'The user avatar can be removed' do
            @user.update!(avatar: Rails.root.join('spec/fixtures/male_avatar_1.jpg').open)
            expect(@user.reload.avatar_url).to be_present
            do_request user: { avatar: nil }
            expect(@user.reload.avatar_url).to be_nil
          end
        end

        describe do
          let(:cf) { create(:custom_field) }
          let(:birthyear_cf) { create(:custom_field_birthyear) }
          let(:custom_field_values) do
            {
              cf.key => 'new value',
              birthyear_cf.key => birthyear
            }
          end
          let(:first_name) { 'Raymond' }
          let(:last_name) { 'Betancourt' }
          let(:email) { 'ray.mond@rocks.com' }
          let(:locale) { 'fr-FR' }
          let(:birthyear) { 1969 }

          example "Can't change some attributes of a user verified with FranceConnect", document: false do
            create(:verification, method_name: 'franceconnect', user: @user)
            @user.update!(custom_field_values: { cf.key => 'original value', birthyear_cf.key => 1950 })
            do_request
            expect(response_status).to eq 200
            @user.reload
            expect(@user.custom_field_values[cf.key]).to eq 'new value'
            expect(@user.first_name).not_to eq first_name
            expect(@user.last_name).not_to eq last_name
            expect(@user.email).to eq email
          end

          example 'Can change many attributes of a user verified with FranceConnect', document: false do
            create(:verification, method_name: 'franceconnect', user: @user)
            do_request
            expect(response_status).to eq 200
            @user.reload
            expect(@user.email).to eq email
            expect(@user.locale).to eq locale
            expect(@user.birthyear).to eq birthyear
          end
        end

        describe do
          let(:cf) { create(:custom_field) }
          let(:gender_cf) { create(:custom_field_gender) }
          let(:custom_field_values) do
            {
              cf.key => 'new value',
              gender_cf.key => 'female'
            }
          end

          example "Can't change gender of a user verified with Bogus", document: false do
            create(:verification, method_name: 'bogus', user: @user)
            @user.update!(custom_field_values: { cf.key => 'original value', gender_cf.key => 'male' })
            do_request
            expect(response_status).to eq 200
            @user.reload
            expect(@user.custom_field_values[cf.key]).to eq 'new value'
            expect(@user.custom_field_values[gender_cf.key]).to eq 'male'
          end
        end
      end

      post 'web_api/v1/users/update_password' do
        with_options scope: :user do
          parameter :current_password, required: true
          parameter :password, required: true
        end
        describe do
          let(:current_password) { 'test_current_password' }
          let(:password) { 'test_new_password' }

          example_request 'update password with wrong current password' do
            expect(response_status).to eq 422
            json_response = json_parse(response_body)
            expect(json_response[:errors][:current_password][0][:error]).to eq 'invalid'
          end
        end

        describe do
          let(:current_password) { 'democracy2.0' }
          let(:password) { 'test_new_password' }

          example_request 'update password with correct current password' do
            @user.reload
            expect(response_status).to eq 200
            expect(BCrypt::Password.new(@user.password_digest)).to be_is_password('test_new_password')
          end
        end

        describe do
          let(:current_password) { '' }
          let(:password) { 'test_new_password' }

          example_request 'update password when not providing existing password' do
            expect(response_status).to eq 422
            json_response = json_parse(response_body)
            expect(json_response[:errors][:current_password][0][:error]).to eq 'invalid'
          end
        end

        describe do
          let(:current_password) { '' }
          let(:password) { 'test_new_password' }

          before do
            @user.update!(password: nil)
          end

          example_request 'update password when no existing password (passwordless or sso user)' do
            @user.reload
            expect(response_status).to eq 200
            expect(BCrypt::Password.new(@user.password_digest)).to be_is_password('test_new_password')
          end
        end
      end

      delete 'web_api/v1/users/:id' do
        before do
          @user.update!(roles: [{ type: 'admin' }])
          @subject_user = create(:admin)
        end

        let(:id) { @subject_user.id }

        example_request 'Delete a user' do
          expect(response_status).to eq 200
          expect { User.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
        end
      end

      get 'web_api/v1/users/:id/ideas_count' do
        let(:id) { @user.id }

        example 'Get the number of ideas published by one user' do
          IdeaStatus.create_defaults
          create(:idea, author: @user)
          create(:idea)
          create(:idea, author: @user, publication_status: 'draft')
          create(:idea, author: @user, project: create(:continuous_native_survey_project))
          do_request
          expect(status).to eq 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :attributes, :count)).to eq 1
        end
      end

      get 'web_api/v1/users/:id/initiatives_count' do
        let(:id) { @user.id }

        example 'Get the number of initiatives published by one user' do
          create(:initiative, author: @user)
          create(:initiative)
          create(:initiative, author: @user, publication_status: 'draft')
          do_request
          assert_status 200
          json_response = json_parse response_body
          expect(json_response.dig(:data, :type)).to eq 'initiatives_count'
          expect(json_response.dig(:data, :attributes, :count)).to eq 1
        end
      end

      get 'web_api/v1/users/:id/comments_count' do
        parameter :post_type, "Count only comments of one post type. Either 'Idea' or 'Initiative'.", required: false

        let(:id) { @user.id }

        example 'Get the number of comments posted by one user' do
          create(:comment, author: @user, post: create(:initiative))
          create(:comment)
          create(:comment, author: @user, post: create(:idea))
          create(:comment, author: @user, publication_status: 'deleted')
          do_request
          expect(status).to eq 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :attributes, :count)).to eq 2
        end

        example 'Get the number of comments on ideas posted by one user' do
          create(:comment, author: @user, post: create(:initiative))
          create(:comment, post: create(:initiative))
          create(:comment, author: @user, post: create(:idea))
          create(:comment, author: @user, post: create(:idea))
          create(:comment, author: @user, publication_status: 'deleted', post: create(:idea))
          do_request post_type: 'Idea'
          expect(status).to eq 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :attributes, :count)).to eq 2
        end

        example 'Get the number of comments on initiatives posted by one user' do
          create(:comment, author: @user, post: create(:initiative))
          create(:comment, author: @user, post: create(:initiative))
          create(:comment, post: create(:idea))
          create(:comment, author: @user, post: create(:idea))
          create(:comment, author: @user, publication_status: 'deleted', post: create(:initiative))
          do_request post_type: 'Initiative'
          expect(status).to eq 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :attributes, :count)).to eq 2
        end
      end
    end
  end
end
