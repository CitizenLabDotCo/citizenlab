require 'rails_helper'

RSpec.describe Volunteering::Volunteer, type: :model do
  describe "Default factory" do
    it "is valid" do
      expect(build(:volunteer)).to be_valid
    end
  end
end
