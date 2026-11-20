# frozen_string_literal: true

require 'rails_helper'

describe PulseCheckPolicy do
  subject { described_class.new(user, pulse_check) }

  let(:owner) { create(:admin) }
  let(:pulse_check) { create(:pulse_check, :shown, user: owner) }

  context 'for a visitor' do
    let(:user) { nil }

    it { is_expected.not_to permit(:show_next) }
    it { is_expected.not_to permit(:answer) }
    it { is_expected.not_to permit(:dismiss) }
  end

  context 'for a resident' do
    let(:user) { create(:user) }

    it { is_expected.not_to permit(:show_next) }
  end

  context 'for a project moderator' do
    let(:user) { create(:project_moderator) }

    it { is_expected.to permit(:show_next) }
  end

  context 'for the owner of a shown pulse check' do
    let(:user) { owner }

    it { is_expected.to permit(:show_next) }
    it { is_expected.to permit(:answer) }
    it { is_expected.to permit(:dismiss) }
  end

  context 'for the owner of a pulse check that was not shown' do
    let(:user) { owner }
    let(:pulse_check) { create(:pulse_check, user: owner) }

    it { is_expected.not_to permit(:answer) }
    it { is_expected.not_to permit(:dismiss) }
  end

  context 'for the owner of an answered pulse check' do
    let(:user) { owner }
    let(:pulse_check) { create(:pulse_check, :shown, user: owner, status: 'answered', score: 5) }

    it { is_expected.to permit(:answer) }
    it { is_expected.not_to permit(:dismiss) }
  end

  context 'for the owner of a dismissed pulse check' do
    let(:user) { owner }
    let(:pulse_check) { create(:pulse_check, :shown, user: owner, status: 'dismissed') }

    it { is_expected.not_to permit(:answer) }
    it { is_expected.not_to permit(:dismiss) }
  end

  context 'for another admin' do
    let(:user) { create(:admin) }

    it { is_expected.not_to permit(:answer) }
    it { is_expected.not_to permit(:dismiss) }
  end

  context 'for another admin viewing an answered pulse check' do
    let(:user) { create(:admin) }
    let(:pulse_check) { create(:pulse_check, :shown, user: owner, status: 'answered', score: 5) }

    it { is_expected.not_to permit(:answer) }
  end

  context 'for a blocked owner' do
    let(:user) { owner }

    before { owner.update!(block_start_at: Time.zone.now, block_end_at: 1.day.from_now) }

    it { is_expected.not_to permit(:answer) }
  end
end
