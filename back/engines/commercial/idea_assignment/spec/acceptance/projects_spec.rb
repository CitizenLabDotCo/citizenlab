# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Projects' do
  explanation 'Ideas have to be posted in a city project, or they can be posted in the open idea box.'

  before do
    header 'Content-Type', 'application/json'
  end

  context 'when admin' do
    before do
      @user = create(:admin)
      token = Knock::AuthToken.new(payload: @user.to_token_payload).token
      header 'Authorization', "Bearer #{token}"
    end

    patch 'web_api/v1/projects/:id' do
      with_options scope: :project do
        parameter :folder_id, 'The ID of the project folder (can be set to nil for top-level projects)', required: false
      end

      ValidationErrorHelper.new.error_fields self, Project

      let(:folder) { create(:project_folder) }
      let(:assignee) { create(:project_folder_moderator, project_folders: [folder]) }
      let(:project1) { create(:project, folder: folder, default_assignee: assignee) }
      let(:project2) { create(:project, folder: folder, default_assignee: assignee) }
      let(:id) { project1.id }

      example 'Assignees of moved project remain valid', document: false, if: defined?(ProjectFolders::Engine) do
        idea1 = create(:idea, project: project1, assignee: assignee)
        idea2 = create(:idea, project: project2, assignee: assignee)

        do_request project: { folder_id: create(:project_folder).id }

        expect(response_status).to eq 200
        expect(project1.reload).to be_valid
        expect(project1.default_assignee_id).to be_blank
        expect(project2.reload).to be_valid
        expect(project2.default_assignee_id).to eq assignee.id
        expect(idea1.reload).to be_valid
        expect(idea1.assignee_id).to be_blank
        expect(idea2.reload).to be_valid
        expect(idea2.assignee_id).to eq assignee.id
      end
    end
  end
end
