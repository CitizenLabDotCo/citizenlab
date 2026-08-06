require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Projects' do
  before_all do
    @user = create(:admin)
  end

  before do
    header_token_for @user
    header 'Content-Type', 'application/json'
  end

  delete 'web_api/v1/projects/:id' do
    let_it_be(:project, reload: true) { create(:project) }
    let_it_be(:idea_import_file1, reload: true) { create(:idea_import_file, project: project) }
    let_it_be(:idea_import_file2, reload: true) { create(:idea_import_file, project: project, parent: idea_import_file1) }
    let(:id) { project.id }

    example_request 'Delete a project that has associated idea_import_files' do
      expect(response_status).to eq 200
      expect { Project.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
      expect { BulkImportIdeas::IdeaImportFile.find(idea_import_file1.id) }.to raise_error(ActiveRecord::RecordNotFound)
      expect { BulkImportIdeas::IdeaImportFile.find(idea_import_file2.id) }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end
