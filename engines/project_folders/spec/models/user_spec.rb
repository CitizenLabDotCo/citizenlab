require 'rails_helper'

RSpec.describe User, type: :model do
  describe "Default factory" do
    it "is valid" do
      expect(build(:user)).to be_valid
    end
  end

  describe "roles" do
    it "is valid without roles" do
      u = build(:user, roles: [])
      expect(u).to be_valid
    end

    it "is valid when the user is an admin" do
      u = build(:user, roles: [{type: "admin"}])
      expect(u).to be_valid
    end

    it "is valid when the user is a project_folder moderator" do
      project_folder = create(:project_folder)
      u = build(:user, roles: [{type: "project_folder_moderator", project_folder_id: project_folder.id}])
      expect(u).to be_valid
    end

    it "is invalid when the user has an unknown role type" do
      u = build(:user, roles: [{type: "stonecarver"}])
      expect{ u.valid? }.to change{ u.errors[:roles] }
    end

    it "is invalid when a project_folder_moderator is missing a project_folder_id" do
      u = build(:user, roles: [{type: "project_folder_moderator"}])
      expect{ u.valid? }.to change{ u.errors[:roles] }
    end
  end

  describe "project_folder_moderator?" do
    it "responds true when the user has the project_folder_moderator role" do
      l = create(:project_folder)
      u = build(:user, roles: [{type: "project_folder_moderator", project_folder_id: l.id}])
      expect(u.project_folder_moderator? l.id).to eq true
    end

    it "responds false when the user does not have a project_folder_moderator role" do
      l = create(:project_folder)
      u = build(:user, roles: [])
      expect(u.project_folder_moderator? l.id).to eq false
    end

    it "responds false when the user does not have a project_folder_moderator role for the given project_folder" do
      l1 = create(:project_folder)
      l2 = create(:project_folder)
      u = build(:user, roles: [{type: "project_folder_moderator", project_folder_id: l1.id}])
      expect(u.project_folder_moderator? l2.id).to eq false
    end

    it "response true when the user is project_folder_moderator and no project_folder_id is passed" do
      u = build(:user, roles: [{type: "project_folder_moderator"}])
      expect(u.project_folder_moderator?).to eq true
    end

    it "response false when the user is not a project_folder_moderator and no project_folder_id is passed" do
      u = build(:admin)
      expect(u.project_folder_moderator?).to eq false
    end
  end
end
