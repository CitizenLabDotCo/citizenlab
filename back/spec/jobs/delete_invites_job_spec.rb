# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DeleteInvitesJob do
  describe '.perform_now' do
    let(:invitee1) { create(:user) }
    let!(:invite1) { create(:invite, invitee: invitee1, created_at: 8.days.ago, accepted_at: nil) }
    let(:invitee2) { create(:user) }
    let!(:invite2) { create(:invite, invitee: invitee2, created_at: 8.days.ago, accepted_at: 2.days.ago) }
    let(:invitee3) { create(:user) }
    let!(:invite3) { create(:invite, invitee: invitee3, created_at: 3.days.ago, accepted_at: nil) }
    let(:expiry_time) { 7.days.ago }

    it 'deletes only expired invites' do
      described_class.perform_now(expiry_time)
      expect { invite1.reload }.to raise_error(ActiveRecord::RecordNotFound)
      expect { invite2.reload }.to raise_error(ActiveRecord::RecordNotFound)
      expect(invite3.reload).to eq invite3
    end

    it 'deletes only users associated with expired && pending invites' do
      described_class.perform_now(expiry_time)
      expect { invitee1.reload }.to raise_error(ActiveRecord::RecordNotFound)
      expect(invitee2.reload).to eq invitee2
      expect(invitee3.reload).to eq invitee3
    end

    it 'logs the activity' do
      allow(Time).to receive(:now).and_return(Time.now)

      invites_to_destroy = Invite.where('created_at < ?', expiry_time)

      expect { described_class.perform_now(expiry_time) }.to have_enqueued_job(LogActivityJob).with(
        "Invite/#{invites_to_destroy.first.id}",
        'bulk_destroy',
        nil, # No user initiated this activity
        Time.now.to_i,
        payload: { destroyed_invites_count: 2 }
      )
    end

    it 'does not log an activity if no invites were destroyed' do
      expect { described_class.perform_now(9.days.ago) }.not_to have_enqueued_job(LogActivityJob)
    end
  end
end
