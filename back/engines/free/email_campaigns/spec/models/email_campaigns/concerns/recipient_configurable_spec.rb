# frozen_string_literal: true

require 'rails_helper'

class RecipientConfigurableCampaignForTest < EmailCampaigns::Campaign
  include EmailCampaigns::RecipientConfigurable
end

RSpec.describe EmailCampaigns::RecipientConfigurable do
  let(:campaign) { RecipientConfigurableCampaignForTest.create! }

  describe 'apply_recipient_filters' do
    it 'uniquely returns all members of all associated groups' do
      g1 = create(:group)
      g2 = create(:group)

      users = [
        create(:user, manual_groups: [g1]),
        create(:user, email: 'u2@test.com'),
        create(:user, manual_groups: [g1], email: 'u3@test.com')
      ]

      campaign.update!(groups: [g1, g2])

      expect(campaign.apply_recipient_filters.all).to contain_exactly(users[0], users[2])
    end

    it 'returns all users when there are no associated groups' do
      create_list(:user, 3)
      campaign.update!(groups: [])
      expect(campaign.apply_recipient_filters.count).to eq User.all.count
    end

    it 'only returns active users when there are no associated groups' do
      u1 = create(:invited_user)
      campaign.update!(groups: [])
      expect(campaign.apply_recipient_filters).not_to include(u1)
    end

    it 'sends to no one when set to an empty group' do
      g1 = create(:group)
      campaign.update!(groups: [g1])
      create(:user)
      expect(campaign.apply_recipient_filters.all).to be_empty
    end

    it 'only returns active users, even when the inactive are in the associated group' do
      g1 = create(:group)
      create(:invited_user, manual_groups: [g1])
      campaign.update!(groups: [g1])
      expect(campaign.apply_recipient_filters).to be_empty
    end
  end
end
