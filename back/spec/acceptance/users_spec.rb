# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require 'test_prof/recipes/rspec/factory_default'

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
      parameter :group, 'Filter by group_id', required: false
      parameter :project, 'Filter by users who participated in the project (by project id)', required: false
      parameter :project_reviewer, 'When true, return only project reviewers. When false, exclude project reviewers.', required: false
      parameter :can_admin, 'Return only admins', required: false
      parameter :can_moderate, 'Return only admins and moderators', required: false

      parameter :can_moderate_project, <<~DESC, required: false
        All admins + users who can moderate the project (by project id), excluding folder moderators of folder
        containing project (who can, in fact, moderate the project), OR All admins + users with project moderator role
        (if no project ID provided).
      DESC

      parameter :is_not_project_moderator, <<~DESC, required: false
        Users who are not project moderators of project, nor folder moderator of folder containing project (by project
        id), OR Users who do not have project moderator role (if no project ID provided).
      DESC

      parameter :is_not_folder_moderator, <<~DESC, required: false
        Users who are not folder moderators of folder (by folder id), OR Users who do not have folder moderator role
        (if no folder ID provided).
      DESC

      parameter :sort, <<~DESC, required: false
        Sort user by 'created_at', '-created_at', 'last_name', '-last_name', 'email', '-email', 'role', '-role'
      DESC

      example_request '[error] List all users' do
        assert_status 401
      end
    end

    get 'web_api/v1/users/as_xlsx' do
      parameter :group, 'Filter by group_id', required: false
      parameter :project, 'Filter by users who participated in the project (by project id)', required: false
      parameter :users, 'Filter out only users with the provided user ids', required: false

      example_request '[error] XLSX export' do
        assert_status 401
      end
    end

    get 'web_api/v1/users/:id' do
      context 'when confirmation is turned on' do
        before do
          @user = create(:user)
          SettingsService.new.activate_feature! 'user_confirmation'
          settings = AppConfiguration.instance.settings
          settings['password_login'] = {
            'allowed' => true,
            'enabled' => true,
            'enable_signup' => true,
            'minimum_length' => 6
          }
        end

        let(:id) { @user.id }

        example 'Get a non-authenticated user does not expose the email', document: false do
          do_request

          assert_status 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :attributes, :email)).to be_nil
        end
      end
    end

    post 'web_api/v1/users/check' do
      with_options scope: :user do
        parameter :email, 'E-mail address to check', required: true
      end

      context 'when confirmation is turned on' do
        before do
          SettingsService.new.activate_feature! 'user_confirmation'
          SettingsService.new.activate_feature! 'password_login'
        end

        context 'when a user does not exist' do
          let(:email) { 'test@test.com' }

          example_request 'Returns "terms"' do
            assert_status 200
            expect(json_response_body[:data][:attributes][:action]).to eq('terms')
          end
        end

        context 'when a user exists without a password and has email confirmed', document: false do
          context 'when the user has not requested any codes yet' do
            before do
              @user = create(:user_no_password, email: 'test@test.com')
              @user.confirm
              @user.save!

              allow(RequestConfirmationCodeJob).to receive(:perform_now)
            end

            let(:email) { 'test@test.com' }

            example_request 'Returns "confirm"' do
              expect(@user.password_digest).to be_nil
              assert_status 200
              expect(json_response_body[:data][:attributes][:action]).to eq('confirm')
              expect(RequestConfirmationCodeJob).to have_received(:perform_now).with(@user)
            end
          end

          context 'when the user has already requested a code' do
            before do
              @user = create(:user_no_password, email: 'test@test.com')
              @user.confirm
              @user.save!

              RequestConfirmationCodeJob.perform_now @user

              allow(RequestConfirmationCodeJob).to receive(:perform_now)
            end

            let(:email) { 'test@test.com' }

            example_request 'Returns "confirm"' do
              expect(@user.password_digest).to be_nil
              assert_status 200
              expect(json_response_body[:data][:attributes][:action]).to eq('confirm')
              expect(RequestConfirmationCodeJob).not_to have_received(:perform_now).with(@user)
            end
          end
        end

        context 'when a user exists without a password and does not have email confirmed' do
          before { @user = create(:user_no_password, email: 'test@email.com') }

          let(:email) { 'test@email.com' }

          example_request 'Returns "confirm"' do
            expect(@user.password_digest).to be_nil
            expect(@user.confirmation_required?).to be true
            assert_status 200
            expect(json_response_body[:data][:attributes][:action]).to eq('confirm')
          end
        end

        context 'when a user exists with a password and has email confirmed', document: false do
          before { @user = create(:user, email: 'test@test.com') }

          let(:email) { 'test@test.com' }

          example_request 'Returns "password"' do
            expect(@user.password_digest).not_to be_nil
            expect(@user.confirmation_required?).to be false
            assert_status 200
            expect(json_response_body[:data][:attributes][:action]).to eq('password')
          end
        end

        context 'when a user exists with a password and does not have email confirmed', document: false do
          before do
            @user = create(:user_with_confirmation, email: 'test@test.com')
            allow(RequestConfirmationCodeJob).to receive(:perform_now)
          end

          let(:email) { 'test@test.com' }

          example_request 'Returns "confirm"' do
            expect(@user.password_digest).not_to be_nil
            expect(@user.confirmation_required?).to be true
            assert_status 200
            expect(json_response_body[:data][:attributes][:action]).to eq('confirm')
            expect(RequestConfirmationCodeJob).to have_received(:perform_now).with(@user)
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

          let(:email) { 'test@test.com' }

          example_request '[error] Taken by invite' do
            assert_status 422
            expect(json_response_body.dig(:errors, :email, 0, :error)).to eq('taken_by_invite')
          end
        end

        context 'when a user exists with different email casing' do
          before { create(:user, email: 'TeSt@EmAiL.com') }

          let(:email) { 'test@email.com' }

          example_request 'Returns "password" for case-insensitive match' do
            assert_status 200
            expect(json_response_body[:data][:attributes][:action]).to eq('password')
          end
        end
      end

      context 'when user confirmation is turned off' do
        before do
          SettingsService.new.deactivate_feature! 'user_confirmation'
          SettingsService.new.activate_feature! 'password_login'
        end

        let(:email) { 'test@test.com' }

        example_request 'returns "terms" when user does not exist' do
          assert_status 200
          expect(json_response_body[:data][:attributes][:action]).to eq('terms')
        end

        example 'returns "password" when user exists with a password' do
          create(:user, email: 'test@test.com')
          do_request
          assert_status 200
          expect(json_response_body[:data][:attributes][:action]).to eq('password')
        end

        example 'returns "token" when user exists without a password' do
          create(:user, email: 'test2@email.com', password: nil)
          do_request(user: { email: 'test2@email.com' })
          assert_status 200
          expect(json_response_body[:data][:attributes][:action]).to eq('token')
        end
      end

      context 'when password_login is turned off' do
        before do
          SettingsService.new.activate_feature! 'user_confirmation'
          SettingsService.new.deactivate_feature! 'password_login'
        end

        let(:email) { 'test@test.com' }

        example_request 'it also works (necessary for ?super_admin param)' do
          assert_status 200
        end
      end
    end

    post 'web_api/v1/users' do
      with_options scope: 'user' do
        parameter :email, 'E-mail address', required: true
        parameter :locale, 'Locale (must be one of the tenant locales)', required: true
        parameter :claim_tokens, <<~DESC
          Tokens used to claim anonymous participation data (e.g., ideas) created before registration.
          If confirmation is required, tokens are marked as pending until confirmed.
          Otherwise, participation data is claimed immediately.
        DESC
      end

      ValidationErrorHelper.new.error_fields(self, User)

      context 'when confirmation is turned on' do
        before do
          SettingsService.new.activate_feature! 'user_confirmation'
          SettingsService.new.activate_feature! 'password_login'
          allow(RequestConfirmationCodeJob).to receive(:perform_now)
        end

        let(:email) { Faker::Internet.email }
        let(:locale) { 'en' }

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

          context 'with claim_tokens' do
            let!(:claim_token) { create(:claim_token) }
            let(:idea) { claim_token.item }
            let(:claim_tokens) { [claim_token.token] }

            example 'marks claim tokens as pending for the new user', document: false do
              do_request
              assert_status 201

              user = User.find(response_data[:id])

              expect(claim_token.reload.pending_claimer_id).to eq(user.id)
              expect(idea.reload.author_id).to be_nil # Not yet claimed
            end
          end
        end

        describe 'When there is an existing user' do
          context 'when there is an existing user that has no password' do
            example 'email taken error is returned and confirmation requirement is not reset' do
              existing_user = create(:user_no_password, email: email)
              existing_user.confirm!

              do_request
              assert_status 422
              expect(json_response_body.dig(:errors, :email, 0, :error)).to eq('taken')
              expect(existing_user.confirmation_required?).to be(false)
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
        parameter :project, 'Filter by users who participated in the project (by project id)', required: false
        parameter :can_moderate_project, 'Filter by users (and admins) who can moderate the project (by id)', required: false
        parameter :can_moderate, 'Return only admins and moderators', required: false
        parameter :can_admin, 'Return only admins if value is true, only non-admins if value is false', required: false
        parameter :project_reviewer, 'Return only admins that are project reviewers', required: false
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

        example 'List all users sorted by last_active_at' do
          User.all.each_with_index do |user, i|
            user.update!(last_active_at: Time.now - i.days)
          end

          do_request sort: 'last_active_at'

          assert_status 200
          json_response = json_parse(response_body)

          sorted_by_last_active_at_emails = User.order(:last_active_at).pluck(:email)
          expect(json_response[:data].map { |u| u.dig(:attributes, :email) }).to eq sorted_by_last_active_at_emails
        end

        example 'List all users sorted by last_active_at lists nil values first', document: false do
          User.all.each_with_index do |user, i|
            user.update!(last_active_at: Time.now - i.days)
          end

          inactive_user = User.last
          inactive_user.update!(last_active_at: nil)

          do_request sort: 'last_active_at'

          assert_status 200
          json_response = json_parse(response_body)

          expect(json_response[:data].map { |u| u.dig(:attributes, :email) }.first).to eq inactive_user.email
        end

        example 'List all users sorted by -last_active_at' do
          User.all.each_with_index do |user, i|
            user.update!(last_active_at: Time.now - i.days)
          end

          do_request sort: '-last_active_at'

          assert_status 200
          json_response = json_parse(response_body)

          sorted_by_last_active_at_emails = User.order(last_active_at: :desc).pluck(:email)
          expect(json_response[:data].map { |u| u.dig(:attributes, :email) }).to eq sorted_by_last_active_at_emails
        end

        example 'List all users sorted by -last_active_at lists nil values last', document: false do
          User.all.each_with_index do |user, i|
            user.update!(last_active_at: Time.now - i.days)
          end

          inactive_user = User.first
          inactive_user.update!(last_active_at: nil)

          do_request sort: '-last_active_at'

          assert_status 200
          json_response = json_parse(response_body)

          expect(json_response[:data].map { |u| u.dig(:attributes, :email) }.last).to eq inactive_user.email
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
            expect(json_response[:data].pluck(:id).reverse.take(2)).to contain_exactly(admin.id, both.id)
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

        example 'Return not found when private_attributes_in_export is disabled' do
          settings = AppConfiguration.instance.settings
          settings['core']['private_attributes_in_export'] = false
          AppConfiguration.instance.update!(settings: settings)

          project = create(:project)

          do_request(project: project.id)
          expect(status).to eq 404
        end

        example 'List all users who participated in a project' do
          project = create(:project)

          # Create participants: users who participated in the project
          participant1 = create(:user)
          participant2 = create(:user)

          # Create non-participants: users who didn't participate
          _non_participant1 = create(:user)
          _non_participant2 = create(:user)

          # Create participation data
          create(:idea, project: project, author: participant1)
          create(:comment, idea: create(:idea), author: participant2)

          # Ensure ParticipantsService finds the participants
          allow_any_instance_of(ParticipantsService).to receive(:project_participants)
            .with(project)
            .and_return(User.where(id: [participant1.id, participant2.id]))

          do_request(project: project.id)
          json_response = json_parse(response_body)

          expect(json_response[:data].size).to eq 2
          expect(json_response[:data].pluck(:id)).to contain_exactly(participant1.id, participant2.id)
        end

        example 'List users who participated in a project with search' do
          project = create(:project)

          participant1 = create(:user, first_name: 'ProjectUser')
          participant2 = create(:user, first_name: 'AnotherParticipant')
          _non_participant = create(:user, first_name: 'ProjectUser')

          # Create participation data
          create(:idea, project: project, author: participant1)
          create(:idea, project: project, author: participant2)

          # Mock ParticipantsService to return only project participants
          allow_any_instance_of(ParticipantsService).to receive(:project_participants)
            .with(project)
            .and_return(User.where(id: [participant1.id, participant2.id]))

          do_request(project: project.id, search: 'ProjectUser')
          json_response = json_parse(response_body)

          expect(json_response[:data].size).to eq 1
          expect(json_response[:data][0][:id]).to eq participant1.id
        end

        example 'Integration test: List users who participated in a project using real ParticipantsService', document: false do
          # This test uses real participation data without mocking ParticipantsService
          project = create(:project)

          participant1 = create(:user)
          participant2 = create(:user)
          non_participant = create(:user)

          # Create real participation data that ParticipantsService will detect
          idea1 = create(:idea, project: project, author: participant1)
          _idea2 = create(:idea, project: project, author: participant2)

          # Also test comment participation
          _comment = create(:comment, idea: idea1, author: participant2)

          # Ensure analytics data is populated if needed
          Analytics::PopulateDimensionsService.populate_types if defined?(Analytics::PopulateDimensionsService)

          do_request(project: project.id)
          json_response = json_parse(response_body)

          # Verify that only participants are returned
          returned_user_ids = json_response[:data].pluck(:id)
          expect(returned_user_ids).to include(participant1.id, participant2.id)
          expect(returned_user_ids).not_to include(non_participant.id)
        end

        describe 'Security tests for project filtering' do
          before do
            @project = create(:project)
            @other_project = create(:project)
            @project_manager = create(:project_moderator, projects: [@project])
            @normal_user = create(:user)
            @participant1 = create(:user)
            @participant2 = create(:user)

            # Create participation data
            create(:idea, project: @project, author: @participant1)
            create(:idea, project: @other_project, author: @participant2)

            # Mock ParticipantsService for both projects
            allow_any_instance_of(ParticipantsService).to receive(:project_participants)
              .with(@project)
              .and_return(User.where(id: [@participant1.id]))
            allow_any_instance_of(ParticipantsService).to receive(:project_participants)
              .with(@other_project)
              .and_return(User.where(id: [@participant2.id]))
          end

          context 'as normal user' do
            before do
              header_token_for @normal_user
            end

            example 'Normal user cannot list users from any project', document: false do
              do_request(project: @project.id)
              expect(status).to eq 401
            end
          end

          context 'as project manager accessing other project' do
            before do
              header_token_for @project_manager
            end

            example 'Project manager can request other project but gets no results due to policy scope', document: false do
              do_request(project: @other_project.id)
              expect(status).to eq 200
              json_response = json_parse(response_body)
              # Policy scope filters out users from projects they don't moderate
              expect(json_response[:data]).to be_empty
            end
          end

          context 'as project manager accessing their project' do
            before do
              header_token_for @project_manager
            end

            example 'Project manager can list users from their project', document: false do
              do_request(project: @project.id)
              expect(status).to eq 200
              json_response = json_parse(response_body)
              expect(json_response[:data].pluck(:id)).to contain_exactly(@participant1.id)
            end
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
          expect(json_response[:data].pluck(:id)).to contain_exactly(a.id, m1.id, @user.id)
        end

        example 'List all users who can moderate' do
          p = create(:project)
          a = create(:admin)
          m1 = create(:project_moderator, projects: [p])
          m2 = create(:project_moderator)
          create(:user)

          do_request(can_moderate: true)
          json_response = json_parse(response_body)
          expect(json_response[:data].pluck(:id)).to contain_exactly(a.id, m1.id, m2.id, @user.id)
        end

        example 'List all moderators who are not admins' do
          p = create(:project)
          m1 = create(:project_moderator, projects: [p])
          m2 = create(:project_moderator)
          f = create(:project_folder_moderator, project_folders: [create(:project_folder)])
          create(:admin, roles: [{ type: 'admin' }, { type: 'project_moderator', project_id: p.id }])
          create(:user)

          do_request(can_moderate: true, can_admin: false)
          json_response = json_parse(response_body)
          expect(json_response[:data].pluck(:id)).to contain_exactly(m1.id, m2.id, f.id)
        end

        example 'List all admins' do
          p = create(:project)
          a = create(:admin)
          create(:user)
          create(:project_moderator, projects: [p])
          create(:project_moderator)

          do_request(can_admin: true)
          json_response = json_parse(response_body)
          expect(json_response[:data].pluck(:id)).to contain_exactly(a.id, @user.id)
        end

        example 'List all project reviewers' do
          create(:user)
          create(:admin)
          project_reviewer = create(:admin, :project_reviewer)

          do_request(project_reviewer: true)

          assert_status 200
          expect(response_ids).to contain_exactly(project_reviewer.id)
        end
      end

      get 'web_api/v1/users/seats' do
        example 'Get number of admin and manager (moderator) seats' do
          create(:super_admin) # super admin are not included in admins

          @admins = [@user, *create_list(:admin, 3)]

          folder_moderators = create_list(:project_folder_moderator, 2, project_folders: [create(:project_folder)])
          project_moderators = create_list(:project_moderator, 4, projects: [create(:project)])
          @moderators = [*folder_moderators, *project_moderators]

          do_request

          expect(status).to eq 200
          expect(response_data[:type]).to eq 'seats'
          attributes = response_data[:attributes]
          expect(attributes[:admins_number]).to eq @admins.size
          expect(attributes[:moderators_number]).to eq @moderators.size
        end
      end

      get 'web_api/v1/users/as_xlsx' do
        parameter :group, 'Filter by group_id', required: false
        parameter :project, 'Filter by users who participated in the project (by project id)', required: false
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
            @project = create(:project)
            @participant1 = create(:user)
            @participant2 = create(:user)
            @non_participant = create(:user)

            # Create participation data
            create(:idea, project: @project, author: @participant1)
            create(:idea, project: @project, author: @participant2)

            # Mock ParticipantsService to return project participants
            allow_any_instance_of(ParticipantsService).to receive(:project_participants)
              .with(@project)
              .and_return(User.where(id: [@participant1.id, @participant2.id]))
          end

          let(:project) { @project.id }

          example_request 'XLSX export all users who participated in a project' do
            expect(status).to eq 200
            xlsx_hash = XlsxService.new.xlsx_to_hash_array RubyXL::Parser.parse_buffer(response_body).stream
            expect(xlsx_hash.pluck('id')).to contain_exactly(@participant1.id, @participant2.id)
          end
        end

        describe 'as project manager' do
          before do
            @project = create(:project)
            @project_manager = create(:project_moderator, projects: [@project])
            @participant1 = create(:user)
            @participant2 = create(:user)

            # Create participation data
            create(:idea, project: @project, author: @participant1)
            create(:idea, project: @project, author: @participant2)

            # Mock ParticipantsService to return project participants
            allow_any_instance_of(ParticipantsService).to receive(:project_participants)
              .with(@project)
              .and_return(User.where(id: [@participant1.id, @participant2.id]))

            header_token_for @project_manager
          end

          let(:project) { @project.id }

          example 'Project manager can export users from their project', document: false do
            do_request
            expect(status).to eq 200
            xlsx_hash = XlsxService.new.xlsx_to_hash_array RubyXL::Parser.parse_buffer(response_body).stream
            expect(xlsx_hash.length).to eq 2
          end
        end

        describe 'security tests' do
          before do
            @project = create(:project)
            @other_project = create(:project)
            @project_manager = create(:project_moderator, projects: [@project])
            @normal_user = create(:user)
            @participant1 = create(:user)
            @participant2 = create(:user)

            # Create participation data for both projects
            create(:idea, project: @project, author: @participant1)
            create(:idea, project: @other_project, author: @participant2)

            # Mock ParticipantsService for both projects
            allow_any_instance_of(ParticipantsService).to receive(:project_participants)
              .with(@project)
              .and_return(User.where(id: [@participant1.id]))
            allow_any_instance_of(ParticipantsService).to receive(:project_participants)
              .with(@other_project)
              .and_return(User.where(id: [@participant2.id]))
          end

          context 'as normal user' do
            before do
              header_token_for @normal_user
            end

            let(:project) { @project.id }

            example 'Normal user cannot export users from any project', document: false do
              do_request
              expect(status).to eq 401
            end
          end

          context 'as project manager accessing other project' do
            before do
              header_token_for @project_manager
            end

            let(:project) { @other_project.id }

            example 'Project manager cannot export users from projects they do not moderate', document: false do
              do_request
              expect(status).to eq 401
            end
          end

          context 'without project parameter (general export)' do
            before do
              header_token_for @project_manager
            end

            example 'Project manager cannot export all users without project filter', document: false do
              do_request
              expect(status).to eq 401
            end
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
        with_options scope: 'user' do
          parameter :block_reason, 'Reason for blocking & any additional information', required: false
        end
        ValidationErrorHelper.new.error_fields(self, User)

        context 'when user blocking is enabled' do
          before do
            settings = AppConfiguration.instance.settings
            settings['user_blocking'] = { 'enabled' => true, 'allowed' => true, 'duration' => 90 }
            AppConfiguration.instance.update!(settings: settings)
          end

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
          let(:project) { create(:single_phase_ideation_project, phase_attrs: { with_permissions: true }) }

          before do
            old_timers = create(:smart_group, rules: [
              {
                ruleType: 'custom_field_number',
                customFieldId: create(:custom_field_number, title_multiloc: { 'en' => 'Birthyear?' }, key: 'birthyear', code: 'birthyear').id,
                predicate: 'is_smaller_than_or_equal',
                value: 1988
              }
            ])

            project.phases.first.permissions.find_by(action: 'posting_idea')
              .update!(permitted_by: 'users', groups: [old_timers])
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

            describe 'profanity in user fields' do
              let(:bio_multiloc) { { en: 'I am a big fucking twat' } }

              example 'profanity is allowed if extended blocking is not enabled', document: false do
                config = AppConfiguration.instance
                config.settings['blocking_profanity'] = { allowed: true, enabled: true, extended_blocking: false }
                config.save!
                do_request
                assert_status 200
              end

              example '[error] profanity is NOT allowed if extended blocking is enabled', document: false do
                config = AppConfiguration.instance
                config.settings['blocking_profanity'] = { allowed: true, enabled: true, extended_blocking: true }
                config.save!
                do_request
                assert_status 422
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

          context 'on an admin' do
            let(:user) { create(:admin) }
            let(:id) { user.id }
            let(:roles) { [{ type: 'admin', project_reviewer: true }] }

            example_request 'Make the admin a project reviewer' do
              assert_status 200

              expect(response_data[:id]).to eq(id)
              expect(response_data.dig(:attributes, :roles)).to match [{ type: 'admin', project_reviewer: true }]
              expect(user.reload.roles).to match [{ 'type' => 'admin', 'project_reviewer' => true }]
            end
          end
        end
      end

      get 'web_api/v1/users/:id/participation_stats' do
        let(:target_user) { create(:user) }
        let(:id) { target_user.id }

        example 'Get participation stats for a user' do
          # Optimization: Eliminates cascades partially
          create_default(:single_phase_ideation_project)
          create_default(:idea_status)

          ideas = create_list(:idea, 3, author: target_user, publication_status: 'published')
          ideas.each { |idea| create(:reaction, user: target_user, reactable: idea) }
          create_list(:comment, 2, author: target_user, publication_status: 'published')
          create(:basket, user: target_user, submitted_at: Time.current)
          create(:poll_response, user: target_user)
          create(:volunteer, user: target_user)
          create(:event_attendance, attendee: target_user)

          do_request

          assert_status 200
          expect(json_parse(response_body).dig(:data, :attributes)).to include(
            ideas_count: 3,
            comments_count: 2,
            reactions_count: 3,
            baskets_count: 1,
            poll_responses_count: 1,
            volunteers_count: 1,
            event_attendances_count: 1
          )
        end

        example 'Does not count unpublished ideas' do
          create(:idea, author: target_user, publication_status: 'published')
          create(:idea, author: target_user, publication_status: 'draft')

          do_request

          assert_status 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :attributes, :ideas_count)).to eq 1
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

      get 'web_api/v1/users/:id/participation_stats' do
        let(:other_user) { create(:user) }
        let(:id) { other_user.id }

        example_request "[error] cannot access another user's participation stats" do
          assert_status :unauthorized
        end
      end

      put 'web_api/v1/users/:id' do
        with_options scope: 'user' do
          parameter :first_name, 'User full name'
          parameter :last_name, 'User full name'
          parameter :new_email, 'E-mail address'
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
          let(:project) { create(:single_phase_ideation_project) }
          let(:onboarding) { { topics_and_areas: 'satisfied' } }

          example_request 'Update a user' do
            assert_status 200
            expect(response_data.dig(:attributes, :first_name)).to eq first_name
            expect(response_data.dig(:attributes, :onboarding)).to eq onboarding
          end
        end

        describe do
          example "Set a user's custom field values" do
            cf = create(:custom_field)
            do_request(user: { custom_field_values: { cf.key => 'somevalue' } })
            json_response = json_parse(response_body)
            expect(json_response.dig(:data, :attributes, :custom_field_values, cf.key.to_sym)).to eq 'somevalue'
          end

          example "Clear out a user's custom field value if set to nil" do
            cf = create(:custom_field)
            cf2 = create(:custom_field)
            @user.update!(custom_field_values: { cf.key => 'somevalue' })

            do_request(user: { custom_field_values: {
              cf.key => nil,
              cf2.key => 'another_value'
            } })

            expect(response_status).to eq 200
            expect(@user.reload.custom_field_values).to eq({
              cf2.key => 'another_value'
            })
          end

          example "Add to user's existing custom field values" do
            cf = create(:custom_field)
            cf2 = create(:custom_field)
            @user.update!(custom_field_values: { cf.key => 'somevalue' })

            do_request(user: { custom_field_values: { cf2.key => 'another_value' } })
            expect(response_status).to eq 200
            expect(@user.reload.custom_field_values).to eq({
              cf.key => 'somevalue',
              cf2.key => 'another_value'
            })
          end

          example "Replace a user's existing custom field value" do
            cf = create(:custom_field)
            cf2 = create(:custom_field)
            @user.update!(custom_field_values: { cf.key => 'somevalue' })

            do_request(user: { custom_field_values: {
              cf.key => 'new_value',
              cf2.key => 'another_value'
            } })

            expect(response_status).to eq 200
            expect(@user.reload.custom_field_values).to eq({
              cf.key => 'new_value',
              cf2.key => 'another_value'
            })
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

        describe 'when user_avatars is enabled' do
          before { SettingsService.new.activate_feature!('user_avatars') }

          example 'The user avatar can be removed' do
            @user.update!(avatar: Rails.root.join('spec/fixtures/male_avatar_1.jpg').open)
            expect(@user.reload.avatar_url).to be_present
            do_request user: { avatar: nil }
            expect(@user.reload.avatar_url).to be_nil
          end
        end

        describe 'when user_avatars is disabled' do
          before do
            SettingsService.new.deactivate_feature!('gravatar_avatars')
            SettingsService.new.deactivate_feature!('user_avatars')
          end

          example 'The user avatar can be removed' do
            @user.update!(avatar: Rails.root.join('spec/fixtures/male_avatar_1.jpg').open)
            expect(@user.reload.avatar_url).to be_present
            do_request user: { avatar: nil }
            expect(@user.reload.avatar_url).to be_nil
          end

          example 'The user avatar cannot be updated', document: false do
            @user.remove_avatar!
            avatar = png_image_as_base64('lorem-ipsum.jpg')
            do_request(user: { avatar: avatar })
            expect(@user.reload.avatar).to be_blank
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
          end

          example 'Can change many attributes of a user verified with FranceConnect', document: false do
            create(:verification, method_name: 'franceconnect', user: @user)
            do_request
            expect(response_status).to eq 200
            @user.reload
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

        describe 'updating the user name when user has no first or last name yet' do
          let(:user) { create(:user, first_name: nil, last_name: nil) }
          let(:id) { user.id }
          let(:first_name) { 'NewFirstName' }
          let(:last_name) { 'NewLastName' }

          before do
            header_token_for user
          end

          example_request 'Updates user name and slug' do
            assert_status 200
            expect(user.reload.first_name).to eq 'NewFirstName'
            expect(user.reload.last_name).to eq 'NewLastName'
            expect(user.reload.slug).to eq 'newfirstname-newlastname'
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

      patch 'web_api/v1/users/update_email_unconfirmed' do
        with_options scope: :user do
          parameter :email, required: true
        end

        context 'when user_confirmation is enabled' do
          before do
            SettingsService.new.activate_feature! 'user_confirmation'
          end

          describe do
            let(:email) { 'new_email@example.com' }

            example_request '[error] does not allow email change' do
              @user.reload
              expect(response_status).to eq 401
              expect(@user.email).not_to eq email
            end
          end
        end

        context 'when user_confirmation is disabled' do
          before do
            SettingsService.new.deactivate_feature! 'user_confirmation'
          end

          describe do
            let(:email) { 'new_email@example.com' }

            example_request 'It allows email change' do
              @user.reload
              expect(response_status).to eq 200
              expect(@user.email).to eq email
            end
          end
        end
      end

      delete 'web_api/v1/users/:id' do
        parameter :delete_participation_data, <<~DESC.squish, required: false
          When true, permanently deletes all participation data associated with the user
          instead of anonymizing it (default: false).
        DESC
        parameter :ban_email, <<~DESC.squish, required: false
          When true, bans the user's email address from future registrations (default: false).
        DESC
        parameter :ban_reason, 'Reason for banning the email (optional, only used when ban_email is true)', required: false

        before do
          @user.update!(roles: [{ type: 'admin' }])
          @subject_user = create(:admin)
        end

        let(:id) { @subject_user.id }

        example_request 'Delete a user' do
          expect(response_status).to eq 200
          expect { User.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
        end

        describe 'with delete_participation_data parameter' do
          example 'Delete a user and their participation data' do
            idea = create(:idea, author: @subject_user)
            comment = create(:comment, author: @subject_user)
            reaction = create(:reaction, user: @subject_user)
            event_attendee = create(:event_attendance, attendee: @subject_user)
            basket = create(:basket, user: @subject_user)
            volunteer = create(:volunteer, user: @subject_user)
            poll_response = create(:poll_response, user: @subject_user)

            do_request(delete_participation_data: true)

            expect(response_status).to eq 200

            expect { User.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
            expect { Idea.find(idea.id) }.to raise_error(ActiveRecord::RecordNotFound)
            expect { Reaction.find(reaction.id) }.to raise_error(ActiveRecord::RecordNotFound)
            expect { Events::Attendance.find(event_attendee.id) }.to raise_error(ActiveRecord::RecordNotFound)
            expect { Basket.find(basket.id) }.to raise_error(ActiveRecord::RecordNotFound)
            expect { Volunteering::Volunteer.find(volunteer.id) }.to raise_error(ActiveRecord::RecordNotFound)
            expect { Polls::Response.find(poll_response.id) }.to raise_error(ActiveRecord::RecordNotFound)

            # Comments are soft-deleted to preserve thread structure
            expect(Comment.find(comment.id).publication_status).to eq('deleted')
          end
        end

        describe 'with ban_email parameter' do
          example 'Delete a user and ban their email' do
            do_request(ban_email: true, ban_reason: 'Spam account')

            expect(response_status).to eq 200
            expect(EmailBan.banned?(@subject_user.email)).to be true
          end
        end
      end

      get 'web_api/v1/users/:id/ideas_count' do
        let(:id) { @user.id }

        example 'Get the number of ideas published by one user' do
          create(:idea_status_proposed)
          create(:idea, author: @user)
          create(:idea)
          create(:idea, author: @user, publication_status: 'draft')
          survey_project = create(:single_phase_native_survey_project)
          create(:idea, author: @user, project: survey_project, creation_phase: survey_project.phases.first)
          do_request
          expect(status).to eq 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :attributes, :count)).to eq 1
        end
      end

      get 'web_api/v1/users/:id/comments_count' do
        let(:id) { @user.id }

        example 'Get the number of comments posted by one user' do
          create(:comment)
          create(:comment, author: @user, idea: create(:idea))
          create(:comment, author: @user, idea: create(:idea))
          create(:comment, author: @user, publication_status: 'deleted')
          do_request
          expect(status).to eq 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :attributes, :count)).to eq 2
        end
      end

      get 'web_api/v1/users/:id/participation_stats' do
        let(:id) { @user.id }

        example 'User can see their own participation stats' do
          create(:idea, author: @user, publication_status: 'published')

          do_request

          assert_status 200
          json_response = json_parse(response_body)
          expect(json_response.dig(:data, :attributes, :ideas_count)).to eq 1
        end
      end
    end
  end
end
