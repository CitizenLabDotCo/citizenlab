require 'rails_helper'


RSpec.describe EmailCampaigns::RecipientConfigurable, type: :model do
  before do
    class RecipientConfigurableCampaign < EmailCampaigns::Campaign
      include EmailCampaigns::RecipientConfigurable
    end

    @campaign = RecipientConfigurableCampaign.create!
  end

  describe "apply_recipient_filters" do
    it "uniquely returns all members of all associated groups" do
      g1 = create(:group)
      g2 = create(:group)

      u1 = create(:user, manual_groups: [g1])
      u2 = create(:user, email: 'u2@test.com')
      u3 = create(:user, manual_groups: [g1], email: 'u3@test.com')

      @campaign.update!(groups: [g1, g2])

      expect(@campaign.apply_recipient_filters.all).to match_array [u1, u3]
    end

    it "returns all users when there are no associated groups" do
      users = create_list(:user, 3)
      @campaign.update!(groups: [])
      expect(@campaign.apply_recipient_filters.count).to eq User.all.count
    end

    it "only returns active users when there are no associated groups" do
      u1 = create(:invited_user)
      @campaign.update!(groups: [])
      expect(@campaign.apply_recipient_filters).not_to include(u1)
    end

    it "only returns active users, even when the inactive are in the associated group" do
      g1 = create(:group)
      u1 = create(:invited_user, manual_groups: [g1])
      @campaign.update!(groups: [g1])
      expect(@campaign.apply_recipient_filters).to be_empty
    end
  end

end
