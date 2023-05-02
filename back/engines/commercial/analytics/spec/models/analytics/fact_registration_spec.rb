# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analytics::FactRegistration do
  context 'when a user registers without invite and has completed registration' do
    let!(:user) { create(:user, invite_status: nil) }

    it 'is also available as a registration fact with a completed date' do
      fact_registration = described_class.find(user.id)
      expect(fact_registration.dimension_date_registration_id).to eq(user.registration_completed_at.to_date)
      expect(fact_registration.dimension_user.invite_status).to be_nil
    end
  end

  context 'when user is invited and the invite is pending' do
    let!(:invite) { create(:invite) }

    it 'is also available as a registration fact without a completion date' do
      fact_registration = described_class.find(invite.invitee_id)
      expect(fact_registration.dimension_date_invited_id).to eq(invite.created_at.to_date)
      expect(fact_registration.dimension_date_registration_id).to be_nil
      expect(fact_registration.dimension_date_accepted_id).to be_nil
      expect(fact_registration.dimension_user.invite_status).to eq('pending')
    end
  end

  context 'when user is invited and the invite is accepted' do
    let!(:accepted_invite) { create(:accepted_invite) }

    it 'is also available as an accepted registration fact' do
      fact_registration = described_class.find(accepted_invite.invitee_id)
      expect(fact_registration.dimension_date_invited_id).to eq(accepted_invite.created_at.to_date)
      expect(fact_registration.dimension_date_registration_id).to eq(accepted_invite.invitee.registration_completed_at.to_date)
      expect(fact_registration.dimension_date_accepted_id).to eq(accepted_invite.accepted_at.to_date)
      expect(fact_registration.dimension_user.invite_status).to eq('accepted')
    end
  end
end
