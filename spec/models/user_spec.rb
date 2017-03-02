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
      u.name = "Not Really_%40)286^$@sluggable"
      u.save
      expect(u.slug).to eq("not-really_-40-286-sluggable")
    end
  end
end
