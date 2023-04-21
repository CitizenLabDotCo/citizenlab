# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Moderators' do
  explanation 'Moderators can manage (e.g. changing phases, ideas) only certain projects or folders.'

  before { header 'Content-Type', 'application/json' }

  context 'when admin' do
    before do
      @user = create(:admin)
      token = Knock::AuthToken.new(payload: @user.to_token_payload).token
      header 'Authorization', "Bearer #{token}"
    end

    delete 'web_api/v1/projects/:project_id/moderators/:user_id', if: defined?(ProjectManagement::Engine) do
      ValidationErrorHelper.new.error_fields self, User

      let(:project1) { create(:project) }
      let(:project2) { create(:project) }
      let(:moderator) { create(:project_moderator, projects: [project1, project2]) }
      let(:other_moderators) { create_list(:project_moderator, 2, projects: [project1]) }
      let(:project_id) { project1.id }
      let(:user_id) { moderator.id }

      example 'Unassigns ideas they no longer moderate', document: false do
        idea1 = create(:idea, assignee: moderator, project: project1)
        idea2 = create(:idea, assignee: moderator, project: project2)

        do_request

        expect(response_status).to eq 200
        expect(idea1.reload).to be_valid
        expect(idea1.assignee_id).to be_blank
        expect(idea2.reload).to be_valid
        expect(idea2.assignee_id).to eq moderator.id
      end

      example 'Unassigns projects they no longer moderate', document: false do
        project1.update! default_assignee: moderator
        project2.update! default_assignee: moderator

        do_request

        expect(response_status).to eq 200
        expect(project1.reload).to be_valid
        expect(project1.default_assignee_id).to be_blank
        expect(project2.reload).to be_valid
        expect(project2.default_assignee_id).to eq moderator.id
      end
    end

    delete 'web_api/v1/project_folders/:project_folder_id/moderators/:user_id', if: defined?(ProjectFolders::Engine) do
      ValidationErrorHelper.new.error_fields self, User

      let(:project1) { create(:project) }
      let(:project2) { create(:project) }
      let(:project3) { create(:project) }
      let(:folder1) { create(:project_folder, projects: [project1, project2]) }
      let(:folder2) { create(:project_folder, projects: [project3]) }
      let(:moderator) { create(:project_folder_moderator, project_folders: [folder2, folder1]) }
      let(:other_moderators) { create_list(:project_folder_moderator, 2, project_folders: [folder1]) }
      let(:project_folder_id) { folder1.id }
      let(:user_id) { moderator.id }

      example 'Unassigns ideas they no longer moderate', document: false do
        idea1 = create(:idea, assignee: moderator, project: project1.reload)
        idea2 = create(:idea, assignee: moderator, project: project2.reload)
        idea3 = create(:idea, assignee: moderator, project: project3.reload)

        do_request

        expect(response_status).to eq 200
        expect(idea1.reload).to be_valid
        expect(idea1.assignee_id).to be_blank
        expect(idea2.reload).to be_valid
        expect(idea2.assignee_id).to be_blank
        expect(idea3.reload).to be_valid
        expect(idea3.assignee_id).to eq moderator.id
      end

      example 'Unassigns projects they no longer moderate', document: false do
        project1.reload.update! default_assignee: moderator
        project2.reload.update! default_assignee: moderator
        project3.reload.update! default_assignee: moderator

        do_request

        expect(response_status).to eq 200
        expect(project1.reload).to be_valid
        expect(project1.default_assignee_id).to be_blank
        expect(project2.reload).to be_valid
        expect(project2.default_assignee_id).to be_blank
        expect(project3.reload).to be_valid
        expect(project3.default_assignee_id).to eq moderator.id
      end
    end
  end
end
