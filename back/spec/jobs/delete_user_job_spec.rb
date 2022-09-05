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

      expect(sidefx_service).to have_received(:after_destroy).with(user, current_user)
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
  end
end
