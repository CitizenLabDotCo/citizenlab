require 'rails_helper'

RSpec.describe Area, type: :model do
  describe "Default factory" do
    it "is valid" do
      expect(build(:area)).to be_valid
    end
  end

  describe "delete an area" do
    it "with an ideas associated to it should succeed" do
      area = create(:area)
      idea = create(:idea, areas: [area])
      expect{ area.destroy }.not_to raise_error
    end
  end
end
