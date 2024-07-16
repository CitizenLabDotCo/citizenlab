# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaign do
  describe 'validate context_id' do
    it 'is invalid if context_id is present && skip_context_absence is false' do
      campaign = build(:invite_received_campaign, context_id: SecureRandom.uuid)
      expect(campaign.send(:skip_context_absence?)).to be false
      expect(campaign).to be_invalid
    end
  end

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
end
