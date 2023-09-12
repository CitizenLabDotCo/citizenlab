# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DeleteInvitesJob do
  # This before block permits us to test the Invite::NO_EXPIRY_BEFORE_CREATED_AT, even when it is set to a date in the
  # near future or recent past, as is the case when developing invite deletion.
  # This can be removed once Invite::EXPIRY_DAYS gives a date a day or 2 after Invite::NO_EXPIRY_BEFORE_CREATED_AT.
  before do
    allow(Time).to receive(:now).and_return(1.month.from_now)
  end

  describe '.perform_now' do
    let(:expiry_days) { Invite::EXPIRY_DAYS }
    let(:expiry_time) { expiry_days.days.ago }
    let(:invitee1) { create(:user) }
    let!(:invite1) do
      create(:invite, invitee: invitee1, created_at: Invite::NO_EXPIRY_BEFORE_CREATED_AT - 1.day, accepted_at: nil)
    end
    let(:invitee2) { create(:user) }
    let!(:invite2) { create(:invite, invitee: invitee2, created_at: (expiry_days + 1).days.ago, accepted_at: nil) }
    let(:invitee3) { create(:user) }
    let!(:invite3) { create(:invite, invitee: invitee3, created_at: (expiry_days + 1).days.ago, accepted_at: 2.days.ago) }
    let(:invitee4) { create(:user) }
    let!(:invite4) { create(:invite, invitee: invitee4, created_at: (expiry_days - 1).days.ago, accepted_at: nil) }

    it 'deletes only expired invites' do
      described_class.perform_now(expiry_time)
      expect(invite1.reload).to eq invite1
      expect { invite2.reload }.to raise_error(ActiveRecord::RecordNotFound)
      expect { invite3.reload }.to raise_error(ActiveRecord::RecordNotFound)
      expect(invite4.reload).to eq invite4
    end

    it 'deletes only users associated with expired && pending invites' do
      described_class.perform_now(expiry_time)
      expect(invitee1.reload).to eq invitee1
      expect { invitee2.reload }.to raise_error(ActiveRecord::RecordNotFound)
      expect(invitee3.reload).to eq invitee3
      expect(invitee4.reload).to eq invitee4
    end

    it 'logs the activity' do
      expect { described_class.perform_now(expiry_time) }.to have_enqueued_job(LogActivityJob).with(
        String,
        'bulk_destroy',
        nil, # No user initiated this activity
        Time.now.to_i,
        payload: { destroyed_invites_ids: [String, String] }
      )
    end

    it 'does not log an activity if no invites were destroyed' do
      expect { described_class.perform_now((expiry_days + 2).days.ago) }.not_to have_enqueued_job(LogActivityJob)
    end
  end
end
