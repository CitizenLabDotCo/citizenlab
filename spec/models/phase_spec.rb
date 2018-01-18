require 'rails_helper'

RSpec.describe Phase, type: :model do
  describe "Default factory" do
    it "is valid" do
      expect(build(:phase)).to be_valid
    end
  end

  describe "description sanitizer" do

    it "sanitizes script tags in the description" do
      phase = create(:phase, description_multiloc: {
        "en" => "<p>Test</p><script>This should be removed!</script>"
      })
      expect(phase.description_multiloc).to eq({"en" => "<p>Test</p>This should be removed!"})
    end
    
  end

  describe "timing validation" do
    it "succeeds when start_at and end_at are equal" do
      phase = build(:phase)
      phase.end_at = phase.start_at
      expect(phase).to be_valid
    end
    it "fails when end_at is before start_at" do
      phase = build(:phase)
      phase.end_at = phase.start_at - 1.day
      expect(phase).to be_invalid
    end
  end

  describe "project validation" do
    it "succeeds when the associated project is a timeline project" do
      phase = build(:phase, project: build(:project, process_type: 'timeline'))
      expect(phase).to be_valid
    end

    it "fails when the associated project is not a timeline project" do
      phase = build(:phase, project: build(:continuous_project))
      expect(phase).to be_invalid
    end
  end
end
