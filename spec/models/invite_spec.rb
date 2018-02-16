require 'rails_helper'

RSpec.describe Invite, type: :model do
  describe "Default factory" do
    it "is valid" do
      expect(build(:invite)).to be_valid
    end
  end
end
