require 'rails_helper'

RSpec.describe EmailCampaigns::Campaign, type: :model do
  describe "Campaign" do
    it "is valid" do
      expect(build(:campaign)).to be_valid
    end
  end
end
