require 'rails_helper'

RSpec.describe Idea, type: :model do
  describe "Default factory" do
    it "is valid" do
      expect(build(:idea)).to be_valid
    end
  end
end
