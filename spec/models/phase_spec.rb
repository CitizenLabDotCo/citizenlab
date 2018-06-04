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

  describe "participation_mode" do
    it "can be null for non-ideation phases" do 
      p = create(:phase, participation_method: 'information')
      p.presentation_mode = nil
      expect(p.save).to eq true
    end

    it "cannot be null for ideation phases" do 
      p = create(:phase, participation_method: 'ideation')
      p.presentation_mode = nil
      expect(p.save).to eq false
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

    it "fails when the associated project has overlapping phases" do
      project = create(:project, process_type: 'timeline')
      other_phase = create(:phase, project: project, start_at: (Time.now - 5.days), end_at: (Time.now + 5.days))
      phase_left_overlap = build(:phase, project: project.reload, start_at: (Time.now - 10.days), end_at: (Time.now - 3.days))
      expect(phase_left_overlap).to be_invalid
      phase_left_overlap = build(:phase, project: project.reload, start_at: (Time.now - 10.days), end_at: (Time.now - 5.days))
      expect(phase_left_overlap).to be_invalid # also not same day
      phase_right_overlap = build(:phase, project: project.reload, start_at: (Time.now + 5.days), end_at: (Time.now + 10.days))
      expect(phase_right_overlap).to be_invalid # also not same day
      phase_inside = build(:phase, project: project.reload, start_at: (Time.now - 3.days), end_at: (Time.now + 3.days))
      expect(phase_inside).to be_invalid
      phase_outside = build(:phase, project: project.reload, start_at: (Time.now - 10.days), end_at: (Time.now + 10.days))
      expect(phase_outside).to be_invalid
      phase_equal = build(:phase, project: project.reload, start_at: (Time.now - 5.days), end_at: (Time.now + 5.days))
      expect(phase_equal).to be_invalid
      phase_left = build(:phase, project: project.reload, start_at: (Time.now - 10.days), end_at: (Time.now - 6.days))
      expect(phase_left).to be_valid
      phase_right = build(:phase, project: project.reload, start_at: (Time.now + 6.days), end_at: (Time.now + 10.days))
      expect(phase_right).to be_valid
    end
  end
end
