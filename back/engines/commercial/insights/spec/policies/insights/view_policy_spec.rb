# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Insights::ViewPolicy do
  subject { described_class.new(user, view) }

  let_it_be(:view) { create(:view) }

  context 'when user is admin' do
    let_it_be(:user) { build(:admin) }

    it { is_expected.to permit(:show) }
    it { is_expected.to permit(:create) }
    it { is_expected.to permit(:destroy) }
    it { is_expected.to permit(:update) }
  end

  context "when user moderates the view's project" do
    let_it_be(:user) { build(:project_moderator, projects: [view.scope]) }

    it { is_expected.to permit(:show) }
    it { is_expected.to permit(:create) }
    it { is_expected.to permit(:destroy) }
    it { is_expected.to permit(:update) }
  end

  context 'when user is a visitor' do
    let_it_be(:user) { nil }

    it { is_expected.not_to permit(:show) }
    it { is_expected.not_to permit(:create) }
    it { is_expected.not_to permit(:destroy) }
    it { is_expected.not_to permit(:update) }
  end

  context 'when user is a regular user' do
    let_it_be(:user) { build(:user) }

    it { is_expected.not_to permit(:show) }
    it { is_expected.not_to permit(:create) }
    it { is_expected.not_to permit(:destroy) }
    it { is_expected.not_to permit(:update) }
  end

  context 'when user is moderator of another project' do
    let_it_be(:user) { build(:project_moderator) }

    it { is_expected.not_to permit(:show) }
    it { is_expected.not_to permit(:create) }
    it { is_expected.not_to permit(:destroy) }
    it { is_expected.not_to permit(:update) }
  end
end
