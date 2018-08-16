require 'rails_helper'

class DisableableCampaign < EmailCampaigns::Campaign
  include EmailCampaigns::Disableable
end

RSpec.describe EmailCampaigns::Disableable, type: :model do
  before do
    @campaign = DisableableCampaign.create
  end
  
  describe "apply_send_filters" do
    it "returns true when the campaign is enabled" do
      @campaign.update(enabled: true)
      expect(@campaign.apply_send_filters).to be_truthy
    end

    it "returns false when the campaign is disabled" do
      @campaign.update(enabled: false)
      expect(@campaign.apply_send_filters).to be_falsy
    end

  end

end
