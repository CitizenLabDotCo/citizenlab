require 'rails_helper'


RSpec.describe EmailCampaigns::SenderConfigurable, type: :model do
  before do
    class SenderConfigurableCampaign < EmailCampaigns::Campaign
      include EmailCampaigns::SenderConfigurable
    end
  end
  
  describe "validations" do
    it "is invalid when the campaign is sent from the autor and has no author" do
      @campaign = SenderConfigurableCampaign.new
      @campaign.sender = 'author'
      @campaign.author = nil
      expect(@campaign).to be_invalid
    end

    it "is valid when the campaign is sent from the author and has an author" do
      @campaign = SenderConfigurableCampaign.new
      @campaign.sender = 'author'
      @campaign.author = create(:user)
      expect(@campaign).to be_valid
    end
  end

end
