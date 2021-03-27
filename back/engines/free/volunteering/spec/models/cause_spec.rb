require 'rails_helper'

RSpec.describe Volunteering::Cause, type: :model do
  describe "Default factory" do
    it "is valid" do
      expect(build(:cause)).to be_valid
    end
  end
end
