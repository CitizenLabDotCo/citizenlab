# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserCustomFields::Representativeness::RefDistributionPolicy do
  subject(:policy) { described_class.new(user, ref_distribution) }

  let_it_be(:ref_distribution) { create(:categorical_distribution) }

  context 'when the user has admin rights' do
    let_it_be(:user) { build(:admin) }

    it { is_expected.to permit(:show) }
    it { is_expected.to permit(:create) }
    it { is_expected.to permit(:destroy) }
  end

  context 'when user is a normal user' do
    let_it_be(:user) { build(:user) }

    it { is_expected.not_to permit(:show) }
    it { is_expected.not_to permit(:create) }
    it { is_expected.not_to permit(:destroy) }
  end

  context 'when user is a visitor' do
    let_it_be(:user) { nil }

    it { is_expected.not_to permit(:show) }
    it { is_expected.not_to permit(:create) }
    it { is_expected.not_to permit(:destroy) }
  end
end
