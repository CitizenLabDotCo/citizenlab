require 'rails_helper'

RSpec.describe EmailCampaigns::Campaign, type: :model do
  describe "Campaign default factory" do
    it "is valid" do
      expect(build(:campaign)).to be_valid
    end
  end

  describe "calculated_recipients" do
    it "uniquely returns all members of all associated groups" do
      g1 = create(:group)
      g2 = create(:smart_group)

      u1 = create(:user, manual_groups: [g1])
      u2 = create(:user, email: 'u2@test.com')
      u3 = create(:user, manual_groups: [g1], email: 'u3@test.com')

      campaign = create(:campaign, groups: [g1, g2])

      expect(campaign.calculated_recipients).to match_array [u1, u2, u3]
    end
  end
end
