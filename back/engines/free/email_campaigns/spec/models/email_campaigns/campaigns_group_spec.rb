# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::CampaignsGroup do
  describe 'CampaignsGroup default factory' do
    it 'is valid' do
      expect(build(:campaigns_group)).to be_valid
    end
  end

  describe 'Deleting a group' do
    it 'deletes the associated CampaignsGroup' do
      campaigns_group = create(:campaigns_group)
      campaigns_group.group.destroy
      expect { campaigns_group.reload }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end

  describe 'Deleting a campaign' do
    it 'deletes the associated CampaignsGroup' do
      campaigns_group = create(:campaigns_group)
      campaigns_group.campaign.destroy
      expect { campaigns_group.reload }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end
