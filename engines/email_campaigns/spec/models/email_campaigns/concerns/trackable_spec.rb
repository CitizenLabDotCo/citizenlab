require 'rails_helper'

class TrackableCampaign < EmailCampaigns::Campaign
  include EmailCampaigns::Trackable
end

RSpec.describe EmailCampaigns::Trackable, type: :model do
  before do
    @campaign = TrackableCampaign.create
  end
  
  describe "sent?" do
    it "returns true when there are deliveries" do
      create_list(:delivery, 3, campaign: @campaign)
      expect(@campaign.sent?).to be_truthy
    end

    it "returns false when there are no deliveries" do
      expect(@campaign.sent?).to be_falsey
    end
  end

  describe "last_delivery_for_recipient" do
    it "returns the sent_at date of the last delivery for the given user" do
      user = create(:user)
      deliveries = create_list(:delivery, 3, campaign: @campaign, user: user, sent_at: Time.now - 2.week)
      deliveries[1].update(sent_at: Time.now - 1.week)

      expect(@campaign.last_delivery_for_recipient(user)).to eq deliveries[1].reload.sent_at
    end

    it "returns nil when there have not been deliveries for the given user" do
      user = create(:user)
      expect(@campaign.last_delivery_for_recipient(user)).to be_nil
    end
  end

end
