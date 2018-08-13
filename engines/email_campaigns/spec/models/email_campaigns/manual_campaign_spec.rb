require 'rails_helper'

RSpec.describe EmailCampaigns::ManualCampaign, type: :model do
  describe "ManualCampaign default factory" do
    it "is valid" do
      expect(build(:manual_campaign)).to be_valid
    end
  end

  describe "calculated_recipients" do
    it "uniquely returns all members of all associated groups" do
      g1 = create(:group)
      g2 = create(:smart_group)

      u1 = create(:user, manual_groups: [g1])
      u2 = create(:user, email: 'u2@test.com')
      u3 = create(:user, manual_groups: [g1], email: 'u3@test.com')

      manual_campaign = create(:manual_campaign, groups: [g1, g2])

      expect(manual_campaign.calculated_recipients).to match_array [u1, u2, u3]
    end
  end
end
