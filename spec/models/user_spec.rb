require 'rails_helper'

RSpec.describe User, type: :model do

  describe "Default factory" do
    it "is valid" do
      expect(build(:user)).to be_valid
    end
  end

  describe "creating a user" do
    it "generates a slug" do
      u = build(:user)
      u.first_name = "Not Really_%40)"
      u.last_name = "286^$@sluggable"
      u.save
      expect(u.slug).to eq("not-really_-40-286-sluggable")
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

    it "is valid when the user is a project moderator" do
      project = create(:project)
      u = build(:user, roles: [{type: "project_moderator", project_id: project.id}])
      expect(u).to be_valid
    end

    it "is invalid when the user has an unknown role type" do
      u = build(:user, roles: [{type: "stonecarver"}])
      expect{ u.valid? }.to change{ u.errors[:roles] }
    end

    it "is invalid when a project_moderator is missing a project_id" do
      u = build(:user, roles: [{type: "project_moderator"}])
      expect{ u.valid? }.to change{ u.errors[:roles] }
    end

  end

  describe "admin?" do

    it "responds true when the user has the admin role" do
      u = build(:user, roles: [{type: "admin"}])
      expect(u.admin?).to eq true
    end

    it "responds false when the user does not have the admin role" do
      u = build(:user, roles: [])
      expect(u.admin?).to eq false
    end

  end

  describe "project_moderator?" do

    it "responds true when the user has the project_moderator role" do
      l = create(:project)
      u = build(:user, roles: [{type: "project_moderator", project_id: l.id}])
      expect(u.project_moderator? l.id).to eq true
    end

    it "responds false when the user does not have a project_moderator role" do
      l = create(:project)
      u = build(:user, roles: [])
      expect(u.project_moderator? l.id).to eq false
    end

    it "responds false when the user does not have a project_moderator role for the given project" do
      l1 = create(:project)
      l2 = create(:project)
      u = build(:user, roles: [{type: "project_moderator", project_id: l1.id}])
      expect(u.project_moderator? l2.id).to eq false
    end

  end

  describe "slug" do

    it "is valid when it's only containing alphanumeric and hyphens" do
      user = build(:user, slug: 'aBc-123-g3S')
      expect(user).to be_valid
    end

    it "is invalid when there's others than alphanumeric and hyphens" do
      user = build(:user, slug: 'ab_c-.asdf@')
      expect{ user.valid? }.to change{ user.errors[:slug] }
    end

    it "is generated on create when not given" do
      user = create(:user, slug: nil)
      expect(user.slug).to be_present
    end

  end

  describe "avatar" do

    it "is automatically generated when it's not specified" do
      user = build(:user, avatar: nil)
      user.save
      expect(user.avatar).to be_present
    end
  end

end
