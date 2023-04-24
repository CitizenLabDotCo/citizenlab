# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Delivery do
  describe 'Delivery default factory' do
    it 'is valid' do
      expect(build(:delivery)).to be_valid
    end
  end

  describe 'Deleting a user' do
    it 'deletes the associated Delivery' do
      delivery = create(:delivery)
      delivery.user.destroy
      expect { delivery.reload }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end

  describe 'Deleting a campaign' do
    it 'deletes the associated Delivery' do
      delivery = create(:delivery)
      delivery.campaign.destroy
      expect { delivery.reload }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end
