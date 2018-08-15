require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::AdminDigest, type: :model do
  describe "AdminDigest Campaign default factory" do
    it "is valid" do
      expect(build(:admin_digest_campaign)).to be_valid
    end
  end

end
