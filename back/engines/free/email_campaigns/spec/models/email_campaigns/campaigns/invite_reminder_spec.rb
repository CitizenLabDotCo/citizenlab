# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::InviteReminder, type: :model do
  describe 'InviteReminder Campaign default factory' do
    it 'is valid' do
      expect(build(:invite_reminder_campaign)).to be_valid
    end
  end

  describe '#apply_recipient_filters' do
    let(:campaign) { create(:invite_reminder_campaign) }
    let(:invite) { create(:invite) }
    let(:activity) { create(:activity, item: invite, action: 'created', user: invite.inviter) }

    it 'does not filter out the invitee' do
      recipients = campaign.apply_recipient_filters(activity: activity)

      expect(recipients.where(id: invite.invitee.id).count).to eq 1
    end

    it 'does not send out anything if the invite is deleted' do
      activity.item.destroy!
      recipients = campaign.apply_recipient_filters(activity: activity.reload)

      expect(recipients.count).to eq 0
    end

    it 'excludes users with pending invite and no email' do
      invitee = create(:user, invite_status: 'pending', email: nil, first_name: 'test_name')
      invite2 = create(:invite, invitee_id: invitee.id)
      activity2 = create(:activity, item: invite2, action: 'created', user: invite2.inviter)

      result = campaign.apply_recipient_filters(activity: activity2)

      expect(result.to_json).not_to include invitee.first_name
      expect(result.count).to eq 0
    end
  end
end
