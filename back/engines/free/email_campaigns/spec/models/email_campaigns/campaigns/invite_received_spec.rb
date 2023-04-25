# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::InviteReceived do
  describe 'InviteReceived Campaign default factory' do
    it 'is valid' do
      expect(build(:invite_received_campaign)).to be_valid
    end
  end

  describe '#generate_commands' do
    let(:campaign) { create(:invite_received_campaign) }
    let(:invite) { create(:invite) }
    let(:activity) { create(:activity, item: invite, action: 'created', user: invite.inviter) }

    it 'generates a command with the desired payload and tracked content' do
      command = campaign.generate_commands(
        recipient: invite.invitee,
        activity: activity
      ).first

      expect(
        command.dig(:event_payload, :inviter_first_name)
      ).to eq(invite.inviter.first_name)
      expect(
        command.dig(:event_payload, :invitee_last_name)
      ).to eq(invite.invitee.last_name)
      expect(
        command.dig(:event_payload, :invite_text)
      ).to eq(invite.invite_text)
    end
  end

  describe '#apply_recipient_filters' do
    let(:campaign) { create(:invite_received_campaign) }
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

  describe '#before_send' do
    let(:campaign) { create(:invite_received_campaign) }
    let(:invite) { create(:invite, send_invite_email: false) }
    let(:activity) { create(:activity, item: invite, action: 'created', user: invite.inviter) }

    it 'returns false when send_invite_email is false' do
      expect(campaign.run_before_send_hooks(activity: activity)).to be_falsy
    end
  end
end
