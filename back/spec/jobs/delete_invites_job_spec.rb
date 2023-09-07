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
  end
end
