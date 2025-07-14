# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaign do
  describe '#apply_recipient_filters' do
    let(:campaign) { create(:invite_received_campaign) }
    let(:invite) { create(:invite) }
    let(:activity) { create(:activity, item: invite, action: 'created', user: invite.inviter) }

    it 'excludes users with pending invite and no email' do
      invitee = create(:user, invite_status: 'pending', email: nil, first_name: 'test_name')
      invite2 = create(:invite, invitee_id: invitee.id)
      activity2 = create(:activity, item: invite2, action: 'created', user: invite2.inviter)

      result = campaign.apply_recipient_filters(activity: activity2)
      expect(result).not_to include invitee
      expect(result.count).to eq 0
    end
  end

  describe '#activity_context' do
    let(:campaign) { create(:comment_on_your_comment_campaign) }
    let(:notification_activity) { create(:activity, item: create(:notification)) }
    let(:area_activity) { create(:activity, item: create(:area)) }

    EmailCampaigns::DeliveryService::CAMPAIGN_CLASSES.each do |campaign_class|
      it 'does not raise errors when implemented' do
        expect do
          campaign = campaign_class.new
          campaign.activity_context(notification_activity)
          campaign.activity_context(area_activity)
        end.not_to raise_error
      end
    end
  end
end
