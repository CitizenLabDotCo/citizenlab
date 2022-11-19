# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserCustomFields::Representativeness::RScorePolicy do
  subject(:policy) { described_class.new(user, :r_score) }

  context 'when the user has admin rights' do
    let_it_be(:user) { build(:admin) }

    it { is_expected.to permit(:show) }
  end

  context 'when user is a normal user' do
    let_it_be(:user) { build(:user) }

    it { is_expected.not_to permit(:show) }
  end

  context 'when user is a visitor' do
    let_it_be(:user) { nil }

    it { is_expected.not_to permit(:show) }
  end
end
