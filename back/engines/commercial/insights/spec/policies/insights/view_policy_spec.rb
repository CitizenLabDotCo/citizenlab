# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Insights::ViewPolicy, type: :policy do
  subject { described_class.new(user, view) }

  let_it_be(:all_views) { create_list(:view, 2, nb_data_sources: 2) }
  let_it_be(:view) { all_views.first }

  let(:scope) { described_class::Scope.new(user, Insights::View) }

  context 'when the user has admin rights' do
    let_it_be(:user) { build(:admin) }

    it { is_expected.to permit(:show) }
    it { is_expected.to permit(:create) }
    it { is_expected.to permit(:destroy) }
    it { is_expected.to permit(:update) }
    it { expect(scope.resolve.count).to eq(2) }
  end

  context 'when the user has moderation rights for all data sources' do
    let_it_be(:user) do
      build(:project_moderator, project_ids: view.data_sources.pluck(:origin_id))
    end

    it { is_expected.to permit(:show) }
    it { is_expected.to permit(:create) }
    it { is_expected.to permit(:destroy) }
    it { is_expected.to permit(:update) }
    it { expect(scope.resolve.count).to eq(1) }
  end

  context 'when the user does not have moderation rights for all data sources' do
    let_it_be(:user) do
      build(:project_moderator, project_ids: [view.data_sources.first.origin_id])
    end

    it { is_expected.not_to permit(:show) }
    it { is_expected.not_to permit(:create) }
    it { is_expected.not_to permit(:destroy) }
    it { is_expected.not_to permit(:update) }
    it { expect(scope.resolve.count).to eq(0) }
  end

  context 'when user is a visitor' do
    let_it_be(:user) { nil }

    it { is_expected.not_to permit(:show) }
    it { is_expected.not_to permit(:create) }
    it { is_expected.not_to permit(:destroy) }
    it { is_expected.not_to permit(:update) }
    it { expect { scope.resolve.count }.to raise_error(Pundit::NotAuthorizedError) }
  end

  context 'when user is a regular user' do
    let_it_be(:user) { build(:user) }

    it { is_expected.not_to permit(:show) }
    it { is_expected.not_to permit(:create) }
    it { is_expected.not_to permit(:destroy) }
    it { is_expected.not_to permit(:update) }
    it { expect { scope.resolve.count }.to raise_error(Pundit::NotAuthorizedError) }
  end

  context 'when user has unrelated moderation rights' do
    let_it_be(:user) { build(:project_moderator) }

    it { is_expected.not_to permit(:show) }
    it { is_expected.not_to permit(:create) }
    it { is_expected.not_to permit(:destroy) }
    it { is_expected.not_to permit(:update) }
    it { expect(scope.resolve.count).to eq(0) }
  end
end
