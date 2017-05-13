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

  describe "description sanitizer" do

    it "sanitizes script tags in the description" do
      project = create(:project, description_multiloc: {
        "en" => "<p>Test</p><script>This should be removed!</script>"
      })
      expect(project.description_multiloc).to eq({"en" => "<p>Test</p>This should be removed!"})
    end
    
  end

  describe "slug" do

    it "is valid when it's only containing alphanumeric and hyphens" do
      project = build(:project, slug: 'aBc-123-g3S')
      expect(project).to be_valid
    end

    it "is invalid when there's others than alphanumeric and hyphens" do
      project = build(:project, slug: 'ab_c-.asdf@')
      expect{ project.valid? }.to change{ project.errors[:slug] }
    end

  end
end
