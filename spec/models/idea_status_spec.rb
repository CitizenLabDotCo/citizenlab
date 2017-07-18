require 'rails_helper'

RSpec.describe IdeaStatus, type: :model do
  context "Default factory" do
    it "is valid" do
      expect(build(:idea_status)).to be_valid
    end
  end
end
