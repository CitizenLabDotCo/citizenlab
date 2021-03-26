require 'rails_helper'

RSpec.describe ProjectFolders::Folder, type: :model do
  describe "Default factory" do
    it "is valid" do
      expect(build(:project_folder)).to be_valid
    end
  end

  describe "Folder without admin publication" do
    it "is invalid" do
      folder = create(:project_folder)
      AdminPublication.where(publication: folder).first.destroy!
      expect(folder.reload).to be_invalid
    end
  end
end