require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Projects' do
  before do
    @user = create(:admin)
    header_token_for @user
    header 'Content-Type', 'application/json'
  end

  delete 'web_api/v1/projects/:id' do
    let(:project) { create(:project) }
    let!(:idea_import_file1) { create(:idea_import_file, project: project) }
    let!(:idea_import_file2) { create(:idea_import_file, project: project, parent: idea_import_file1) }
    let(:id) { project.id }

    example_request 'Delete a project that has associated idea_import_files' do
      expect(response_status).to eq 200
      expect { Project.find(id) }.to raise_error(ActiveRecord::RecordNotFound)
      expect { BulkImportIdeas::IdeaImportFile.find(idea_import_file1.id) }.to raise_error(ActiveRecord::RecordNotFound)
      expect { BulkImportIdeas::IdeaImportFile.find(idea_import_file2.id) }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end
