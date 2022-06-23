# frozen_string_literal: true

require 'rails_helper'

describe Verification::SideFxVerificationService do
  let(:service) { described_class.new }
  let(:verification) { create(:verification) }
  let(:user) { verification.user }

  describe 'after_create' do
    it "logs a 'created' action when a verification is created" do
      expect { service.after_create(verification, user) }
        .to have_enqueued_job(LogActivityJob).with(verification, 'created', user, verification.created_at.to_i, payload: { method: 'cow' })
    end

    it 'toggles verified on the user' do
      expect(user.verified).to be false
      service.after_create(verification, user)
      expect(user.reload.verified).to be true
    end

    it 'schedules an UpdateMemberCountJob' do
      expect { service.after_create(verification, user) }
        .to have_enqueued_job(UpdateMemberCountJob)
    end
  end
end
