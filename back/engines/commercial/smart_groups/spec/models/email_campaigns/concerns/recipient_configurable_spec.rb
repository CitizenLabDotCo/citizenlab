# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::RecipientConfigurable do
  let :recipient_configurable_campaign_class do
    Class.new(EmailCampaigns::Campaign) do
      include EmailCampaigns::RecipientConfigurable
      def self.name
        'RecipientConfigurableCampaign'
      end
    end
  end
  let(:campaign) { recipient_configurable_campaign_class.create! }

  describe 'apply_recipient_filters' do
    it 'uniquely returns all members of all associated groups' do
      g1 = create(:group)
      g2 = create(:smart_group)

      u1 = create(:user, manual_groups: [g1])
      u2 = create(:user, email: 'u2@test.com')
      u3 = create(:user, manual_groups: [g1], email: 'u3@test.com')

      campaign.update!(groups: [g1, g2])

      expect(campaign.apply_recipient_filters.all).to contain_exactly(u1, u2, u3)
    end
  end
end
