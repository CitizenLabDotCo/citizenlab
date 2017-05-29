require 'rails_helper'

RSpec.describe Activity, type: :model do

  context "Default factory" do
    it "is valid" do
      expect(build(:activity)).to be_valid
    end
  end

end
