# frozen_string_literal: true

require 'rails_helper'

describe EmailCampaigns::SendManualCampaignService do
  subject(:service) { described_class.new }

  let(:user) { create(:admin) }

  describe '#call' do
    let(:campaign) { create(:manual_campaign) }
    let!(:users) { create_list(:user, 3) }

    it 'sends to all recipients and returns true' do
      result = service.call(campaign, user)
      expect(result).to be true
      expect(campaign.deliveries.count).to eq User.count
    end

    it 'clears scheduled_at' do
      campaign.scheduled_at = 2.hours.from_now
      campaign.save!
      service.call(campaign, user)
      expect(campaign.reload.scheduled_at).to be_nil
    end

    context 'when the campaign has already been sent' do
      before { create(:delivery, campaign: campaign) }

      it 'returns false with an already_sent error' do
        result = service.call(campaign, user)
        expect(result).to be false
        expect(campaign.errors.details[:base]).to include(error: :already_sent)
      end

      it 'does not create additional deliveries' do
        expect { service.call(campaign, user) }.not_to change(campaign.deliveries, :count)
      end
    end
  end
end
