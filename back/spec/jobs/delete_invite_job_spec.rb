# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DeleteInviteJob do
  describe '.perform_now' do
    let(:invitee) { create(:user) }
    let(:invite) { create(:invite, invitee: invitee) }

    it 'deletes the invite record' do
      described_class.perform_now(invite)
      expect { invite.reload }.to raise_error(ActiveRecord::RecordNotFound)
    end

    it 'deletes the invite record from invite identifier' do
      described_class.perform_now(invite.id)
      expect { invite.reload }.to raise_error(ActiveRecord::RecordNotFound)
    end

    it 'deletes the associated user if invite pending' do
      described_class.perform_now(invite)
      expect { invitee.reload }.to raise_error(ActiveRecord::RecordNotFound)
    end

    it 'does NOT delete the associated user if invite accepted' do
      invite.update!(accepted_at: Time.zone.now)
      described_class.perform_now(invite)
      expect(invitee.reload).to eq invitee
    end

    context 'when the invite does not exist' do
      before do
        invite.destroy!
      end

      it 'raises an error' do
        expect { described_class.perform_now(invite.id) }
          .to raise_error(ActiveRecord::RecordNotFound)
      end
    end
  end
end
