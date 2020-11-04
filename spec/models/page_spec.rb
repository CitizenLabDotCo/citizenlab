require 'rails_helper'

RSpec.describe Page, type: :model do

  describe "Default factory" do
    it "is valid" do
      expect(build(:page)).to be_valid
    end
  end

end
