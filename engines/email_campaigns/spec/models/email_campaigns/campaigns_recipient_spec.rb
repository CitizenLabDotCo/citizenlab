require 'rails_helper'

RSpec.describe EmailCampaigns::CampaignsRecipient, type: :model do
  describe "CampaignsRecipient default factory" do
    it "is valid" do
      expect(build(:campaigns_recipient)).to be_valid
    end
  end

  describe "Deleting a user" do
    it "deletes the associated CampaignsRecipient" do
      campaigns_recipient = create(:campaigns_recipient)
      campaigns_recipient.user.destroy
      expect{campaigns_recipient.reload}.to raise_error(ActiveRecord::RecordNotFound)
    end
  end

  describe "Deleting a campaign" do
    it "deletes the associated CampaignsRecipient" do
      campaigns_recipient = create(:campaigns_recipient)
      campaigns_recipient.campaign.destroy
      expect{campaigns_recipient.reload}.to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end
