require 'rails_helper'


RSpec.describe EmailCampaigns::Disableable, type: :model do
  before do
    class DisableableCampaign < EmailCampaigns::Campaign
      include EmailCampaigns::Disableable
    end

    @campaign = DisableableCampaign.create!
  end
  
  describe "run_before_send_hooks" do
    it "returns true when the campaign is enabled" do
      @campaign.update!(enabled: true)
      expect(@campaign.run_before_send_hooks).to be_truthy
    end

    it "returns false when the campaign is disabled" do
      @campaign.update!(enabled: false)
      expect(@campaign.run_before_send_hooks).to be_falsy
    end
  end
end
