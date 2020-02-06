require 'rails_helper'

RSpec.describe ProjectFolder, type: :model do
  describe "Default factory" do
    it "is valid" do
      expect(build(:project_folder)).to be_valid
    end
  end

  describe "delete" do
    it "should preserve project ordering" do
      f1 = create(:project_folder)
      f2 = create(:project_folder)
      p3 = create(:project, folder: f2)
      p2 = create(:project, folder: f1)
      p1 = create(:project, folder: f1)
      p1.move_to_top
      p1.save!
      f1.projects.order(ordering: :desc).update(folder_id: f2.id)

      expect(f2.reload.projects.published.order(:ordering).pluck(:ordering)).to eq [0, 1, 2]
      expect(f2.reload.projects.published.order(:ordering).pluck(:id)).to eq [p1.id, p2.id, p3.id]
    end
  end

end
