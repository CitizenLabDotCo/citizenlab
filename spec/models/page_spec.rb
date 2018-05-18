require 'rails_helper'

RSpec.describe Page, type: :model do

  describe "Default factory" do
    it "is valid" do
      expect(build(:page)).to be_valid
    end
  end

  describe "slug" do

    it "is valid when it's only containing alphanumeric and hyphens" do
      page = build(:page, slug: 'aBc-123-g3S')
      expect(page).to be_valid
    end

    it "is invalid when there's others than alphanumeric and hyphens" do
      page = build(:page, slug: 'ab_c-.asdf@')
      expect{ page.valid? }.to change{ page.errors[:slug] }
    end

  end


end
