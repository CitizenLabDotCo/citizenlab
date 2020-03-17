require 'rails_helper'

RSpec.describe Maps::Layer, type: :model do

  describe "Default factory" do
    it "is valid" do
      expect(build(:layer)).to be_valid
    end
  end
end
