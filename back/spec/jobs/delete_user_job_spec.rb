# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DeleteUserJob do
  describe '.perform_now' do
    let(:user) { create(:user) }

    it 'deletes the user record' do
      described_class.perform_now(user)
      expect { user.reload }.to raise_error(ActiveRecord::RecordNotFound)
    end

    it 'deletes the user record from user identifier' do
      described_class.perform_now(user.id)
      expect { user.reload }.to raise_error(ActiveRecord::RecordNotFound)
    end

    it 'triggers after_destroy side effects' do
      sidefx_service = instance_spy(SideFxUserService, 'sidefx_service')
      allow(SideFxUserService).to receive(:new).and_return(sidefx_service)

      current_user = build_stubbed(:user)
      described_class.perform_now(user.id, current_user)

      expect(sidefx_service).to have_received(:after_destroy)
        .with(user, current_user, participation_data_deleted: false)
    end

    context 'with delete_participation_data: true' do
      let(:current_user) { create(:admin) }

      it 'deletes user participation data' do
        participation_service = instance_spy(ParticipantsService, 'participation_service')
        allow(ParticipantsService).to receive(:new).and_return(participation_service)

        described_class.perform_now(user.id, current_user, delete_participation_data: true)

        expect(participation_service)
          .to have_received(:destroy_user_participation_data).with(user)
      end

      it 'passes participation_data_deleted to side effects' do
        sidefx_service = instance_spy(SideFxUserService, 'sidefx_service')
        allow(SideFxUserService).to receive(:new).and_return(sidefx_service)

        described_class.perform_now(user.id, current_user, delete_participation_data: true)

        expect(sidefx_service).to have_received(:after_destroy).with(user, current_user, participation_data_deleted: true)
      end
    end

    context 'when the user does not exist' do
      before do
        user.destroy!
      end

      it 'raise an error' do
        expect { described_class.perform_now(user.id) }
          .to raise_error(ActiveRecord::RecordNotFound)
      end
    end

    context 'with ban_email: true' do
      let(:current_user) { create(:admin) }
      let(:user) { create(:user, email: 'banned.user+test@gmail.com') }

      it 'bans the user email' do
        expect { described_class.perform_now(user.id, current_user, ban_email: true) }
          .to change(EmailBan, :count).by(1)
        expect(EmailBan.find_for('banned.user+test@gmail.com')).to be_present
      end

      it 'stores the ban reason' do
        described_class.perform_now(user.id, current_user, ban_email: true, ban_reason: 'Spam account')
        ban = EmailBan.find_for('banned.user+test@gmail.com')

        expect(ban.reason).to eq 'Spam account'
        expect(ban.banned_by).to eq current_user
      end

      it 'does not ban email when ban_email is false' do
        expect { described_class.perform_now(user.id, current_user, ban_email: false) }
          .not_to change(EmailBan, :count)
      end

      it 'does not ban email when user has no email' do
        user.update_column(:email, nil)
        expect { described_class.perform_now(user.id, current_user, ban_email: true) }
          .not_to change(EmailBan, :count)
      end
    end
  end
end
