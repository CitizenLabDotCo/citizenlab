require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::Manual, type: :model do
  describe "Manual Campaign default factory" do
    it "is valid" do
      expect(build(:manual_campaign)).to be_valid
    end
  end

end
