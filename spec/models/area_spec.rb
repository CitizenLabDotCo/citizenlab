require 'rails_helper'

RSpec.describe Area, type: :model do
  describe "Default factory" do
    it "is valid" do
      expect(build(:area)).to be_valid
    end
  end
end
