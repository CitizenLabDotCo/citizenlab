require 'rails_helper'

describe AdminHierarchyScope do
  let!(:space1) { create(:space) }
  let!(:space2) { create(:space) }
  let!(:folder1) { create(:project_folder, space: space1) }
  let!(:folder2) { create(:project_folder) }

  describe '.spaces' do
    context 'when the spaces feature is on' do
      before { SettingsService.new.activate_feature!('spaces') }

      it 'returns all spaces for an admin' do
        expect(described_class.spaces(create(:admin))).to contain_exactly(space1, space2)
      end

      it 'returns the spaces a space moderator manages' do
        expect(described_class.spaces(create(:space_moderator, spaces: [space1]))).to contain_exactly(space1)
      end

      it 'returns no spaces for a folder moderator' do
        expect(described_class.spaces(create(:project_folder_moderator, project_folders: [folder2]))).to be_empty
      end

      it 'can be used as a subquery of ids' do
        ids = described_class.spaces(create(:admin)).select(:id)
        expect(Space.where(id: ids)).to contain_exactly(space1, space2)
      end
    end

    context 'when the spaces feature is off' do
      before { SettingsService.new.deactivate_feature!('spaces') }

      it 'returns no spaces, even for an admin' do
        expect(described_class.spaces(create(:admin))).to be_empty
      end
    end
  end

  describe '.folders' do
    it 'returns all folders for an admin' do
      expect(described_class.folders(create(:admin))).to contain_exactly(folder1, folder2)
    end

    it 'returns the folders in a space moderator\'s spaces' do
      expect(described_class.folders(create(:space_moderator, spaces: [space1]))).to contain_exactly(folder1)
    end

    it 'returns the folders a folder moderator manages' do
      expect(described_class.folders(create(:project_folder_moderator, project_folders: [folder2]))).to contain_exactly(folder2)
    end

    it 'returns no folders for a project moderator' do
      expect(described_class.folders(create(:project_moderator))).to be_empty
    end
  end
end
