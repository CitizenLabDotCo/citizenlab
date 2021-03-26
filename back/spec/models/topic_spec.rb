require 'rails_helper'

RSpec.describe Topic, type: :model do
  describe "Default factory" do
    it "is valid" do
      expect(build(:topic)).to be_valid
    end
  end
end
