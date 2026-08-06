# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Projects' do
  explanation 'Ideas have to be posted in a city project, or they can be posted in the open idea box.'

  before do
    header 'Content-Type', 'application/json'
  end

  context 'when admin' do
    before { admin_header_token }

    patch 'web_api/v1/projects/:id' do
      with_options scope: :project do
        parameter :folder_id, 'The ID of the project folder (can be set to nil for top-level projects)', required: false
      end

      ValidationErrorHelper.new.error_fields self, Project

      let_it_be(:folder, reload: true) { create(:project_folder) }
      let_it_be(:assignee, reload: true) { create(:project_folder_moderator, project_folders: [folder]) }
      let_it_be(:project1, reload: true) { create(:project, folder: folder, default_assignee: assignee) }
      let_it_be(:project2, reload: true) { create(:project, folder: folder, default_assignee: assignee) }
      let(:id) { project1.id }

      example 'Assignees of moved project remain valid', document: false do
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
