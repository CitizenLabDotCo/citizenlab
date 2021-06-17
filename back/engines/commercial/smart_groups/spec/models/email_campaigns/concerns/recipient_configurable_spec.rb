require 'rails_helper'


RSpec.describe EmailCampaigns::RecipientConfigurable, type: :model do
  before do
    class RecipientConfigurableCampaign < EmailCampaigns::Campaign
      include EmailCampaigns::RecipientConfigurable
    end

    @campaign = RecipientConfigurableCampaign.create!
  end

  describe 'apply_recipient_filters' do
    it 'uniquely returns all members of all associated groups' do
      g1 = create(:group)
      g2 = create(:smart_group)

      u1 = create(:user, manual_groups: [g1])
      u2 = create(:user, email: 'u2@test.com')
      u3 = create(:user, manual_groups: [g1], email: 'u3@test.com')

      @campaign.update!(groups: [g1, g2])

      expect(@campaign.apply_recipient_filters.all).to match_array [u1, u2, u3]
    end
  end
end
