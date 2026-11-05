# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailBanPolicy do
  subject { described_class.new(user, :email_ban) }

  context 'for a visitor' do
    let(:user) { nil }

    it { is_expected.not_to permit(:count) }
    it { is_expected.not_to permit(:show) }
    it { is_expected.not_to permit(:destroy) }
  end

  context 'for a resident' do
    let(:user) { create(:user) }

    it { is_expected.not_to permit(:count) }
    it { is_expected.not_to permit(:show) }
    it { is_expected.not_to permit(:destroy) }
  end

  context 'for a moderator' do
    let(:user) { create(:project_moderator) }

    it { is_expected.not_to permit(:count) }
    it { is_expected.not_to permit(:show) }
    it { is_expected.not_to permit(:destroy) }
  end

  context 'for an admin' do
    let(:user) { create(:admin) }

    it { is_expected.to permit(:count) }
    it { is_expected.to permit(:show) }
    it { is_expected.to permit(:destroy) }
  end
end
