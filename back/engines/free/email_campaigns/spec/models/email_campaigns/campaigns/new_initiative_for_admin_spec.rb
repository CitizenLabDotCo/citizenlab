# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::NewInitiativeForAdmin do
  describe 'NewInitiativeForAdmin Campaign default factory' do
    it 'is valid' do
      expect(build(:new_initiative_for_admin_campaign)).to be_valid
    end
  end

  describe 'apply_recipient_filters' do
    let(:campaign) { build(:new_initiative_for_admin_campaign) }

    it 'filters out normal users' do
      initiative = create(:initiative)
      create(:user)
      admin = create(:admin)

      expect(campaign.apply_recipient_filters(activity: create(:activity, item: initiative, action: 'published')).ids).to match_array([admin.id])
    end
  end

  describe 'apply_recipient_filters' do
    let(:campaign) { build(:new_initiative_for_admin_campaign) }

    it 'filters out everyone if the author is admin' do
      author = create(:admin)
      initiative = create(:initiative, author: author)
      create(:admin)

      expect(campaign.apply_recipient_filters(activity: create(:activity, item: initiative, action: 'published')).count).to eq 0
    end
  end
end
