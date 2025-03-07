# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Users' do
  explanation 'Citizens and city administrators.'

  before { header 'Content-Type', 'application/json' }

  context 'when admin' do
    before { admin_header_token }

    patch 'web_api/v1/users/:id' do
      with_options scope: 'user' do
        parameter :roles, 'Roles array, only allowed when admin'
      end
      ValidationErrorHelper.new.error_fields self, User

      let(:id) { assignee.id }
      let(:roles) { [] }

      describe 'when removing admin rights' do
        let(:assignee) { create(:admin) }

        example 'Remove user as assignee', document: false do
          assigned_idea = create(:idea, assignee: assignee)

          do_request

          expect(response_status).to eq 200
          expect(assignee.reload).not_to be_admin
          expect(assigned_idea.reload.assignee_id).to be_blank
        end

        example 'Remove user as default assignee', document: false do
          project = create(:project, default_assignee: assignee)

          do_request

          expect(response_status).to eq 200
          expect(assignee.reload).not_to be_admin
          expect(project.reload.default_assignee_id).to be_blank
        end
      end

      describe 'when removing project moderator rights' do
        let(:project) { create(:project) }
        let(:assignee) { create(:project_moderator, projects: [project]) }

        example 'Remove user as assignee', document: false do
          assigned_idea = create(:idea, project: project, assignee: assignee)

          do_request

          expect(response_status).to eq 200
          expect(assigned_idea.reload.assignee_id).to be_blank
        end

        example 'Remove user as default assignee', document: false do
          project.update! default_assignee: assignee

          do_request

          expect(response_status).to eq 200
          expect(project.reload.default_assignee_id).to be_blank
        end
      end

      describe 'when removing folder moderator rights' do
        let(:folder) { create(:project_folder) }
        let(:assignee) { create(:project_folder_moderator, project_folders: [folder]) }

        example 'Remove user as assignee', document: false do
          assigned_idea = create(:idea, project: create(:project, folder: folder), assignee: assignee)

          do_request

          expect(response_status).to eq 200
          expect(assigned_idea.reload.assignee_id).to be_blank
        end

        example 'Remove user as default assignee', document: false do
          project = create(:project, folder: folder, default_assignee: assignee)

          do_request

          expect(response_status).to eq 200
          expect(project.reload.default_assignee_id).to be_blank
        end
      end

      describe 'when admin becomes project moderator' do
        let(:project1) { create(:project) }
        let(:project2) { create(:project) }
        let(:assignee) { create(:admin) }

        example 'Remove user as assignee', document: false do
          idea1 = create(:idea, project: project1, assignee: assignee)
          idea2 = create(:idea, project: project2, assignee: assignee)

          do_request(user: { roles: [{ 'type' => 'project_moderator', 'project_id' => project1.id }] })

          expect(response_status).to eq 200
          expect(idea1.reload).to be_valid
          expect(idea1.assignee_id).to eq assignee.id
          expect(idea2.reload).to be_valid
          expect(idea2.assignee_id).to be_blank
        end

        example 'Remove user as default assignee', document: false do
          project1.update! default_assignee: assignee
          project2.update! default_assignee: assignee

          do_request(user: { roles: [{ 'type' => 'project_moderator', 'project_id' => project1.id }] })

          expect(response_status).to eq 200
          expect(project1.reload).to be_valid
          expect(project1.default_assignee_id).to eq assignee.id
          expect(project2.reload).to be_valid
          expect(project2.default_assignee_id).to be_blank
        end
      end

      describe 'when admin becomes folder moderator' do
        let(:folder1) { create(:project_folder) }
        let(:folder2) { create(:project_folder) }
        let(:assignee) { create(:admin) }

        example 'Remove user as assignee', document: false do
          idea1 = create(:idea, project: create(:project, folder: folder1), assignee: assignee)
          idea2 = create(:idea, project: create(:project, folder: folder2), assignee: assignee)

          do_request(user: { roles: [{ 'type' => 'project_folder_moderator', 'project_folder_id' => folder1.id }] })

          expect(response_status).to eq 200
          expect(idea1.reload).to be_valid
          expect(idea1.assignee_id).to eq assignee.id
          expect(idea2.reload).to be_valid
          expect(idea2.assignee_id).to be_blank
        end

        example 'Remove user as default assignee', document: false do
          project1 = create(:project, folder: folder1, default_assignee: assignee)
          project2 = create(:project, folder: folder2, default_assignee: assignee)

          do_request(user: { roles: [{ 'type' => 'project_folder_moderator', 'project_folder_id' => folder1.id }] })

          expect(response_status).to eq 200
          expect(project1.reload).to be_valid
          expect(project1.default_assignee_id).to eq assignee.id
          expect(project2.reload).to be_valid
          expect(project2.default_assignee_id).to be_blank
        end
      end

      describe 'when folder moderator becomes project moderator' do
        let(:folder) { create(:project_folder) }
        let(:project1) { create(:project, folder: folder) }
        let(:project2) { create(:project, folder: folder) }
        let(:assignee) { create(:project_folder_moderator, project_folders: [folder]) }

        example 'Remove user as assignee', document: false do
          idea1 = create(:idea, project: project1, assignee: assignee)
          idea2 = create(:idea, project: project2, assignee: assignee)

          do_request(user: { roles: [{ 'type' => 'project_moderator', 'project_id' => project1.id }] })

          expect(response_status).to eq 200
          expect(idea1.reload).to be_valid
          expect(idea1.assignee_id).to eq assignee.id
          expect(idea2.reload).to be_valid
          expect(idea2.assignee_id).to be_blank
        end

        example 'Remove user as default assignee', document: false do
          project1.update! default_assignee: assignee
          project2.update! default_assignee: assignee

          do_request(user: { roles: [{ 'type' => 'project_moderator', 'project_id' => project1.id }] })

          expect(response_status).to eq 200
          expect(project1.reload).to be_valid
          expect(project1.default_assignee_id).to eq assignee.id
          expect(project2.reload).to be_valid
          expect(project2.default_assignee_id).to be_blank
        end
      end
    end

    delete 'web_api/v1/users/:id' do
      let(:assignee) { create(:admin) }
      let(:id) { assignee.id }

      example 'Remove deleted user as assignee', document: false do
        assigned_idea = create(:idea, assignee: @subject_user)

        do_request

        expect(response_status).to eq 200
        expect(assigned_idea.reload.assignee_id).to be_blank
      end
    end
  end
end
