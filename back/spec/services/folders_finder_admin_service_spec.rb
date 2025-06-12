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
end
