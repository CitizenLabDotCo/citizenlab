require 'rails_helper'

class ConsentableCampaign < EmailCampaigns::Campaign
  include EmailCampaigns::Consentable
end

RSpec.describe EmailCampaigns::Consentable, type: :model do
  before do
    @campaign = ConsentableCampaign.create
  end
  
  describe "apply_recipient_filters" do
    it "includes a user when the she consented with the campaign" do
      consent = create(:consent, campaign_type: @campaign.type)
      expect(@campaign.apply_recipient_filters.all).to include(consent.user)
    end

    it "includes a user when no consent exists" do
      user = create(:user)
      expect(@campaign.apply_recipient_filters.all).to include(user)
    end

    it "doesn't include a user when consented is false" do
      consent = create(:consent, campaign_type: @campaign.type, consented: false)
      expect(@campaign.apply_recipient_filters.all).not_to include(consent.user)
    end
  end

end
