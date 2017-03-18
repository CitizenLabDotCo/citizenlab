require 'rails_helper'

RSpec.describe Lab, type: :model do
  describe "Default factory" do
    it "is valid" do
      expect(build(:lab)).to be_valid
    end
  end

  describe "Factory with topics" do
    it "is valid" do
      expect(create(:lab_with_topics)).to be_valid
    end
    it "has topics" do
      expect(create(:lab_with_topics).topics).to_not be_empty
    end
  end

  describe "Factory with areas" do
    it "is valid" do
      expect(create(:lab_with_areas)).to be_valid
    end
    it "has areas" do
      expect(create(:lab_with_areas).areas).to_not be_empty
    end
  end
end
