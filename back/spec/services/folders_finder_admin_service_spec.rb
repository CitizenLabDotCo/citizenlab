require 'rails_helper'

describe FoldersFinderAdminService do
  describe 'self.execute' do
    it 'works' do
      scope = ProjectFolders::Folder.all
      params = {}
      result = described_class.execute(scope, params)
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
      result = described_class.filter_status(scope, params)

      expect(result).to include(published_folder)
      expect(result).not_to include(draft_folder)
    end

    it 'returns original scope if no status provided' do
      scope = ProjectFolders::Folder.all
      params = {}
      result = described_class.filter_status(scope, params)

      expect(result).to include(published_folder)
      expect(result).to include(draft_folder)
    end
  end

  describe 'self.filter_folder_manager' do
    let!(:f1) { create(:project_folder) }
    let!(:f2) { create(:project_folder) }
    let!(:f3) { create(:project_folder) }

    let!(:user1) { create(:user, roles: [{ 'type' => 'project_folder_moderator', project_folder_id: f1.id }]) }
    let!(:user2) { create(:user, roles: [{ 'type' => 'project_folder_moderator', project_folder_id: f2.id }]) }

    it 'returns folders managed by specified users' do
      result = described_class.filter_folder_manager(ProjectFolders::Folder.all, { managers: [user1.id] })
      expect(result.pluck(:id)).to eq([f1.id])
    end

    it 'returns all folders when no managers specified' do
      result = described_class.filter_folder_manager(ProjectFolders::Folder.all, {})
      expect(result.pluck(:id)).to match_array([f1.id, f2.id, f3.id])
    end
  end
end
