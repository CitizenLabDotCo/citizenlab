require 'rails_helper'

describe ProjectsFinderAdminService do
  describe 'self.execute' do
    it 'works' do
      scope = ProjectFolders::Folder.all
      params = {}
      result = FoldersFinderAdminService.execute(scope, params)
      expect(result).to eq(scope)
    end
  end

  describe 'self.filter_status' do
    let!(:published_folder) { create(:project_folder) }
    let!(:draft_folder) do
      folder = create(:project_folder)
      publication = AdminPublication.find_by(publication_id: folder.id, publication_type: 'ProjectFolders::Folder')
      publication.update!(publication_status: 'draft')
      folder
    end

    it 'filters by status' do
      scope = ProjectFolders::Folder.all
      params = { status: ['published'] }
      result = FoldersFinderAdminService.filter_status(scope, params)

      expect(result).to include(published_folder)
      expect(result).not_to include(draft_folder)
    end

    it 'returns original scope if no status provided' do
      scope = ProjectFolders::Folder.all
      params = {}
      result = FoldersFinderAdminService.filter_status(scope, params)

      expect(result).to include(published_folder)
      expect(result).to include(draft_folder)
    end
  end
end
