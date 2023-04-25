# frozen_string_literal: true

require 'rails_helper'

class TrackableCampaignForTest < EmailCampaigns::Campaign
  include EmailCampaigns::Trackable
end

RSpec.describe EmailCampaigns::Trackable do
  let(:campaign) { TrackableCampaignForTest.create! }

  describe 'sent?' do
    it 'returns true when there are deliveries' do
      create_list(:delivery, 3, campaign: campaign)
      expect(campaign.sent?).to be true
    end

    it 'returns false when there are no deliveries' do
      expect(campaign.sent?).to be false
    end
  end

  describe 'last_delivery_for_recipient' do
    it 'returns the sent_at date of the last delivery for the given user' do
      user = create(:user)
      deliveries = create_list(:delivery, 3, campaign: campaign, user: user, sent_at: Time.now - 2.weeks)
      deliveries[1].update(sent_at: Time.now - 1.week)

      expect(campaign.last_delivery_for_recipient(user)).to eq deliveries[1].reload.sent_at
    end

    it 'returns nil when there have not been deliveries for the given user' do
      user = create(:user)
      expect(campaign.last_delivery_for_recipient(user)).to be_nil
    end
  end

  describe 'run_after_send_hooks' do
    it 'creates a delivery' do
      command = {
        event_payload: {},
        recipient: create(:user),
        tracked_content: {}
      }
      campaign.run_after_send_hooks(command)
      expect(EmailCampaigns::Delivery.first).to have_attributes({
        campaign_id: campaign.id,
        user_id: command[:recipient].id,
        delivery_status: 'sent'
      })
    end
  end
end
