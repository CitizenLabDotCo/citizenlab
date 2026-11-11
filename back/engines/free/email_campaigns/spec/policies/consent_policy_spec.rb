# frozen_string_literal: true

require 'rails_helper'

describe EmailCampaigns::ConsentPolicy do
  subject { described_class.new(user, consent) }

  let(:owner) { create(:user) }
  let(:consent) { create(:consent, user: owner, campaign_type: create(:manual_campaign).type) }

  context 'for a visitor' do
    let(:user) { nil }

    it { is_expected.not_to permit(:index) }
    it { is_expected.not_to permit(:update) }
    it { is_expected.not_to permit(:update_by_campaign_id) }
  end

  context 'for the owner of the consent' do
    let(:user) { owner }

    it { is_expected.to permit(:index) }
    it { is_expected.to permit(:update) }
    it { is_expected.to permit(:update_by_campaign_id) }
  end

  context 'for the owner of the consent who is not active' do
    let(:owner) { create(:invited_user) }
    let(:user) { owner }

    it { is_expected.not_to permit(:index) }
    it { is_expected.not_to permit(:update) }
    it { is_expected.to permit(:update_by_campaign_id) }
  end

  context 'for a pending invitee and the invite reminder' do
    let(:owner) { create(:invited_user) }
    let(:user) { owner }
    let(:consent) { create(:consent, user: owner, campaign_type: create(:invite_reminder_campaign).type) }

    it { is_expected.to permit(:update_by_campaign_id) }
  end

  context 'for a registered user and the invite reminder' do
    let(:user) { owner }
    let(:consent) { create(:consent, user: owner, campaign_type: create(:invite_reminder_campaign).type) }

    it { is_expected.not_to permit(:update_by_campaign_id) }

    context 'when opting out (e.g. the invite was accepted since the reminder was sent)' do
      before { consent.consented = false }

      it { is_expected.to permit(:update_by_campaign_id) }
    end
  end

  context 'for a transactional email' do
    let(:user) { owner }
    let(:consent) { create(:consent, user: owner, campaign_type: 'EmailCampaigns::Campaigns::PhoneConfirmation', consented: false) }

    it { is_expected.not_to permit(:update_by_campaign_id) }
  end

  context 'for another user' do
    let(:user) { create(:user) }

    it { is_expected.not_to permit(:update) }
    it { is_expected.not_to permit(:update_by_campaign_id) }
  end
end
