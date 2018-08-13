require 'rails_helper'

RSpec.describe EmailCampaigns::ManualCampaignsRecipient, type: :model do
  describe "ManualCampaignsRecipient default factory" do
    it "is valid" do
      expect(build(:manual_campaigns_recipient)).to be_valid
    end
  end

  describe "Deleting a user" do
    it "deletes the associated ManualCampaignsRecipient" do
      manual_campaigns_recipient = create(:manual_campaigns_recipient)
      manual_campaigns_recipient.user.destroy
      expect{manual_campaigns_recipient.reload}.to raise_error(ActiveRecord::RecordNotFound)
    end
  end

  describe "Deleting a manual campaign" do
    it "deletes the associated ManualCampaignsRecipient" do
      manual_campaigns_recipient = create(:manual_campaigns_recipient)
      manual_campaigns_recipient.manual_campaign.destroy
      expect{manual_campaigns_recipient.reload}.to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end
