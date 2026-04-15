# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Moderators' do
  explanation 'Moderators can manage (e.g. changing phases, ideas) only certain project_folders.'

  before do
    header 'Content-Type', 'application/json'
  end

  context 'as a folder moderator' do
    let!(:project_folder) { create(:project_folder) }
    let!(:moderator) { create(:project_folder_moderator, project_folders: [project_folder]) }

    before do
      header_token_for(moderator)
    end

    get 'web_api/v1/project_folders/:project_folder_id/moderators' do
      with_options scope: :page do
        parameter :number, 'Page number'
        parameter :size, 'Number of members per page'
      end

      let!(:same_folder_moderators) { create_list(:project_folder_moderator, 5, project_folders: [project_folder]) }
      let!(:other_project_folder) { create(:project_folder) }

      example 'List all moderators of a project_folder' do
        do_request project_folder_id: project_folder.id
        expect(status).to eq(200)
        expect(response_data.size).to eq same_folder_moderators.size + 1
      end

      example '[error] List all moderators of a project_folder you don\'t moderate' do
        do_request project_folder_id: other_project_folder.id
        expect(status).to eq(401)
      end
    end

    get 'web_api/v1/project_folders/:project_folder_id/moderators/:user_id' do
      ValidationErrorHelper.new.error_fields(self, User)

      let(:project_folder_id) { project_folder.id }
      let(:user_id) { create(:user).id }
      let(:other_moderators) { create_list(:project_folder_moderator, 2, project_folders: [project_folder]) }
      let(:user_id) { other_moderators.first.id }

      example_request 'Get one moderator by id' do
        expect(status).to eq 200
        expect(response_data[:id]).to eq other_moderators.first.id
      end
    end

    post 'web_api/v1/project_folders/:project_folder_id/moderators' do
      with_options scope: :moderator do
        parameter :user_id, 'The id of user to become moderator.', required: false
        parameter :user_email, 'The email of user to become moderator.', required: false
      end

      ValidationErrorHelper.new.error_fields(self, User)

      let(:project_folder_id) { project_folder.id }
      let!(:child_projects) { create_list(:project, 3) }

      shared_examples 'adding a moderator' do
        example_request 'Add a moderator role' do
          assert_status 200
          expect(response_data[:type]).to eq 'user'
          expect(LogActivityJob).to have_been_enqueued.with(test_user, 'project_folder_moderation_rights_received', moderator, kind_of(Integer), payload: { project_folder_id: project_folder.id })
        end

        context 'with limited seats' do
          before do
            config = AppConfiguration.instance
            config.settings['core']['maximum_moderators_number'] = User.billed_moderators.count + 1
            config.settings['core']['additional_moderators_number'] = 0
            config.save!
          end

          context 'when limit is reached' do
            before { create(:project_folder_moderator) } # to reach the limit

            example_request 'Increments additional seats', document: false do
              assert_status 200
              expect(AppConfiguration.instance.settings['core']['additional_moderators_number']).to eq(1)
            end
          end

          example_request 'Does not increment additional seats if limit is not reached', document: false do
            assert_status 200
            expect(AppConfiguration.instance.settings['core']['additional_moderators_number']).to eq(0)
          end
        end
      end

      context 'with user_id' do
        let(:test_user) { create(:user) }
        let(:user_id) { test_user.id }

        include_examples 'adding a moderator'
      end

      context 'with user_email' do
        let(:test_user) { create(:user) }
        let(:user_email) { test_user.email }

        include_examples 'adding a moderator'
      end
    end

    delete 'web_api/v1/project_folders/:project_folder_id/moderators/:user_id' do
      ValidationErrorHelper.new.error_fields(self, User)

      let(:moderator_of_same_folder) { create(:project_folder_moderator, project_folders: [project_folder]) }

      let(:other_project_folder) { create(:project_folder) }
      let(:moderator_of_other_folder) { create(:project_folder_moderator, project_folders: [other_project_folder]) }

      example 'Delete a moderator of moderated project_folder' do
        n_roles_before = moderator_of_same_folder.reload.roles.size
        do_request project_folder_id: project_folder.id, user_id: moderator_of_same_folder.id

        expect(response_status).to eq 200
        expect(moderator_of_same_folder.reload.roles.size).to eq(n_roles_before - 1)
        expect(LogActivityJob).to have_been_enqueued.with(moderator_of_same_folder, 'project_folder_moderation_rights_removed', moderator, kind_of(Integer), payload: { project_folder_id: project_folder.id })
      end

      example '[Unauthorized] Delete a moderator of unmoderated project_folder' do
        n_roles_before = moderator_of_other_folder.reload.roles.size
        do_request project_folder_id: other_project_folder.id, user_id: moderator_of_other_folder.id

        expect(response_status).to eq 401
        expect(moderator_of_other_folder.reload.roles.size).to eq(n_roles_before)
      end
    end
  end

  context 'as an admin' do
    let(:admin) { create(:admin) }

    before do
      header_token_for(admin)
    end

    get 'web_api/v1/project_folders/:project_folder_id/moderators' do
      with_options scope: :page do
        parameter :number, 'Page number'
        parameter :size, 'Number of members per page'
      end

      let(:project_folder) { create(:project_folder) }
      let(:project_folder_id) { project_folder.id }
      let(:user_id) { create(:user).id }
      let(:other_moderators) { create_list(:project_folder_moderator, 2, project_folders: [project_folder]) }
      let(:project_folder_id) { project_folder.id }
      let(:user_id) { other_moderators.first.id }
      let!(:same_project_folder_moderators) { create_list(:project_folder_moderator, 2, project_folders: [project_folder]) }

      example 'List all moderators of a project_folder', document: false do
        do_request
        expect(status).to eq(200)
        expect(response_data.size).to eq same_project_folder_moderators.size
      end
    end

    get 'web_api/v1/project_folders/:project_folder_id/moderators/:user_id' do
      ValidationErrorHelper.new.error_fields(self, User)

      let(:project_folder) { create(:project_folder) }
      let(:project_folder_id) { project_folder.id }
      let(:user_id) { create(:user).id }
      let(:other_moderators) { create_list(:project_folder_moderator, 2, project_folders: [project_folder]) }
      let(:project_folder_id) { project_folder.id }
      let(:user_id) { other_moderators.first.id }

      example_request 'Get one moderator by id' do
        expect(status).to eq 200
        expect(response_data[:id]).to eq other_moderators.first.id
      end
    end

    post 'web_api/v1/project_folders/:project_folder_id/moderators' do
      with_options scope: :moderator do
        parameter :user_id, 'The id of user to become moderator.', required: false
        parameter :user_email, 'The email of user to become moderator.', required: false
      end

      ValidationErrorHelper.new.error_fields(self, User)

      let(:moderator) { create(:project_folder_moderator, project_folders: [project_folder]) }
      let(:project_folder) { create(:project_folder) }
      let(:project_folder_id) { project_folder.id }
      let!(:child_projects) { create_list(:project, 3, folder: project_folder) }

      shared_examples 'adding a folder moderator' do
        example 'Add a moderator role' do
          expect(test_user.reload.moderatable_project_ids).to be_empty
          expect(test_user.roles).to be_empty

          do_request

          assert_status 200
          expect(response_data[:type]).to eq 'user'
          expect(test_user.reload.roles).to eq([{ 'type' => 'project_folder_moderator', 'project_folder_id' => project_folder.id }])
          expect(test_user.reload.moderatable_project_ids).to match_array(child_projects.map(&:id))
          expect(LogActivityJob).to have_been_enqueued.with(test_user, 'project_folder_moderation_rights_received', admin, kind_of(Integer), payload: { project_folder_id: project_folder.id })
        end
      end

      context 'with user_id' do
        let(:test_user) { create(:user) }
        let(:user_id) { test_user.id }

        include_examples 'adding a folder moderator'

        example '[error] Returns error when user_id does not match any user' do
          do_request(moderator: { user_id: 'non-existent-id' })
          expect(response_status).to eq 404
        end
      end

      context 'with user_email' do
        let(:test_user) { create(:user) }
        let(:user_email) { test_user.email }

        include_examples 'adding a folder moderator'

        context 'when email does not match any user' do
          let(:user_email) { 'newuser@example.com' }

          example 'Sends an invite to the email address' do
            expect do
              do_request
            end.to change(InvitesImport, :count).by(1)
              .and have_enqueued_job(Invites::BulkCreateJob)

            assert_status 202

            # Verify the invite has correct parameters
            import = InvitesImport.last
            expect(import.job_type).to eq 'bulk_create'
            expect(import.importer).to eq admin
          end

          example 'Creates invite with correct role and project_folder' do
            do_request

            expect(Invites::BulkCreateJob).to have_been_enqueued.with(
              admin,
              hash_including(
                emails: [user_email],
                roles: [{ type: 'project_folder_moderator', project_folder_id: project_folder_id }]
              ),
              kind_of(String), # import.id
              xlsx_import: false
            )
          end
        end
      end
    end

    delete 'web_api/v1/project_folders/:project_folder_id/moderators/:user_id' do
      ValidationErrorHelper.new.error_fields self, User

      describe 'when moderating projects in a folder' do
        before do
          @project_folder = create(:project_folder)
          other_moderators = create_list(:project_folder_moderator, 2, project_folders: [@project_folder])
          @user = other_moderators.first
          @child_projects = create_list(:project, 3)
          @child_projects.first.update! folder: @project_folder
          @user.add_role('project_moderator', project_id: @child_projects.first.id)
          @user.save!
        end

        let(:project_folder_id) { @project_folder.id }
        let(:user_id) { @user.id }

        example 'Delete the moderator role of a user for a project_folder' do
          expect(@user.reload.roles).to include({ 'type' => 'project_folder_moderator', 'project_folder_id' => @project_folder.id })

          do_request
          expect(response_status).to eq 200

          # We expect the existing project moderator role(s) for project(s) in the folder to remain,
          # and the project_folder_moderator role to be removed.
          expect(@user.reload.roles).to eq([{ 'type' => 'project_moderator', 'project_id' => @child_projects.first.id }])
          expect(@user.reload.moderatable_project_ids).to eq [@child_projects.first.id]

          expect(LogActivityJob).to have_been_enqueued.with(@user, 'project_folder_moderation_rights_removed', admin, kind_of(Integer), payload: { project_folder_id: @project_folder.id })
        end
      end
    end
  end
end
