require 'rails_helper'

RSpec.describe Project, type: :model do
  describe "Default factory" do
    it "is valid" do
      expect(build(:project)).to be_valid
    end
  end

  describe "Factory with topics" do
    it "is valid" do
      expect(create(:project_with_topics)).to be_valid
    end
    it "has topics" do
      expect(create(:project_with_topics).topics).to_not be_empty
    end
  end

  describe "Factory with areas" do
    it "is valid" do
      expect(create(:project_with_areas)).to be_valid
    end
    it "has areas" do
      expect(create(:project_with_areas).areas).to_not be_empty
    end
  end
end
