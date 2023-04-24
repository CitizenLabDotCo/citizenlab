# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::InviteReminder do
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
  end
end
