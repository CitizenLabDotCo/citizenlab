require 'rails_helper'

RSpec.describe EmailCampaigns::ManualCampaignsGroup, type: :model do
  describe "ManualCampaignsGroup default factory" do
    it "is valid" do
      expect(build(:manual_campaigns_group)).to be_valid
    end
  end

  describe "Deleting a group" do
    it "deletes the associated ManualCampaignsGroup" do
      manual_campaigns_group = create(:manual_campaigns_group)
      manual_campaigns_group.group.destroy
      expect{manual_campaigns_group.reload}.to raise_error(ActiveRecord::RecordNotFound)
    end
  end

  describe "Deleting a manual campaign" do
    it "deletes the associated ManualCampaignsGroup" do
      manual_campaigns_group = create(:manual_campaigns_group)
      manual_campaigns_group.manual_campaign.destroy
      expect{manual_campaigns_group.reload}.to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end
