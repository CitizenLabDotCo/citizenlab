# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ContentBuilder::CustomBlockPolicy do
  subject(:policy) { described_class.new(user, custom_block) }

  let(:custom_block) { create(:custom_block) }

  before { SettingsService.new.activate_feature!('custom_page_blocks') }

  context 'for a visitor' do
    let(:user) { nil }

    it { is_expected.not_to permit(:index) }
    it { is_expected.not_to permit(:create) }
    it { is_expected.not_to permit(:update) }
    it { is_expected.not_to permit(:destroy) }
    it { is_expected.not_to permit(:show) }
    it { is_expected.not_to permit(:bundle) }
    it { is_expected.not_to permit(:versions_index) }
    it { is_expected.not_to permit(:versions_create) }

    context 'when the block is published' do
      let(:custom_block) { create(:custom_block, :published) }

      it { is_expected.to permit(:show) }
      it { is_expected.to permit(:bundle) }
      it { is_expected.not_to permit(:versions_index) }
      it { is_expected.not_to permit(:versions_create) }
    end
  end

  context 'for a regular user' do
    let(:user) { create(:user) }

    it { is_expected.not_to permit(:index) }
    it { is_expected.not_to permit(:create) }
    it { is_expected.not_to permit(:show) }
    it { is_expected.not_to permit(:bundle) }
  end

  context 'for an active admin' do
    let(:user) { create(:admin) }

    it { is_expected.to permit(:index) }
    it { is_expected.to permit(:create) }
    it { is_expected.to permit(:update) }
    it { is_expected.to permit(:destroy) }
    it { is_expected.to permit(:show) }
    it { is_expected.to permit(:bundle) }
    it { is_expected.to permit(:versions_index) }
    it { is_expected.to permit(:versions_create) }
  end

  context 'when the feature is not activated' do
    before { SettingsService.new.deactivate_feature!('custom_page_blocks') }

    context 'for an active admin' do
      let(:user) { create(:admin) }

      it { is_expected.not_to permit(:index) }
      it { is_expected.not_to permit(:create) }
      it { is_expected.not_to permit(:update) }
      it { is_expected.not_to permit(:destroy) }
      it { is_expected.not_to permit(:show) }
      it { is_expected.not_to permit(:bundle) }
      it { is_expected.not_to permit(:versions_index) }
      it { is_expected.not_to permit(:versions_create) }
    end

    context 'for a visitor and a published block' do
      let(:user) { nil }
      let(:custom_block) { create(:custom_block, :published) }

      it { is_expected.not_to permit(:show) }
      it { is_expected.not_to permit(:bundle) }
    end
  end

  describe 'Scope' do
    subject(:resolved_scope) { described_class::Scope.new(user, ContentBuilder::CustomBlock).resolve }

    let!(:draft_block) { create(:custom_block) }
    let!(:published_block) { create(:custom_block, :published) }

    context 'for an active admin' do
      let(:user) { create(:admin) }

      it { is_expected.to contain_exactly(draft_block, published_block) }
    end

    context 'for a visitor' do
      let(:user) { nil }

      it { is_expected.to contain_exactly(published_block) }
    end

    context 'when the feature is not activated' do
      let(:user) { create(:admin) }

      before { SettingsService.new.deactivate_feature!('custom_page_blocks') }

      it { is_expected.to be_empty }
    end
  end
end
