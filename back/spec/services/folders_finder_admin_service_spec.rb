require 'rails_helper'

describe FoldersFinderAdminService do
  describe 'self.execute' do
    let!(:f1) { create(:project_folder) }
    let!(:f2) do
      folder = create(:project_folder)
      publication = AdminPublication.find_by(publication_id: folder.id, publication_type: 'ProjectFolders::Folder')
      publication.update!(publication_status: 'draft')
      folder
    end
    let!(:f3) { create(:project_folder) }

    let!(:user1) { create(:user, roles: [{ 'type' => 'project_folder_moderator', project_folder_id: f1.id }]) }
    let!(:user2) { create(:user, roles: [{ 'type' => 'project_folder_moderator', project_folder_id: f2.id }]) }

    it 'works' do
      scope = ProjectFolders::Folder.all
      params = { status: ['published'], managers: [user1.id, user2.id] }
      result = described_class.execute(scope, params)
      # Only f1 should be returned, as it is the only one that is published AND managed by a user in the
      # specified list of managers.
      expect(result).to match_array([f1])
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

  describe 'self.search' do
    let!(:p1) { create(:project_folder, title_multiloc: { 'en' => 'Test Folder 1' }) }
    let!(:p2) { create(:project_folder, title_multiloc: { 'en' => 'Another Folder' }) }
    let!(:p3) { create(:project_folder, title_multiloc: { 'en' => 'Test Folder 2' }) }

    it 'filters projects by search term' do
      result = described_class.search(ProjectFolders::Folder.all, { search: 'Test' })
      expect(result.pluck(:id)).to match_array([p1, p3].pluck(:id))
    end

    it 'returns all projects when search term is empty' do
      result = described_class.search(ProjectFolders::Folder.all, {})
      expect(result.pluck(:id)).to match_array([p1, p2, p3].pluck(:id))
    end
  end
end
