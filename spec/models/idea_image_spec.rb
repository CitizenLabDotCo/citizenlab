require 'rails_helper'

RSpec.describe IdeaImage, type: :model do
  describe "Default factory" do
    it "is valid" do
      expect(build(:comment)).to be_valid
    end
  end
end
