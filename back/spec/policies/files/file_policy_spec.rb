# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Files::FilePolicy do
  describe 'policy' do
    subject { described_class.new(user, file) }

    # In this test group, the default is that the user is the uploader.
    let(:file) { create(:file, uploader: user) }

    context 'for visitor' do
      let(:file) { create(:file) }
      let(:user) { nil }

      it { is_expected.not_to permit(:show) }
      it { is_expected.not_to permit(:create) }
      it { is_expected.not_to permit(:destroy) }
    end

    context 'for user' do
      let(:user) { create(:user) }

      it { is_expected.not_to permit(:show) }
      it { is_expected.not_to permit(:create) }
      it { is_expected.not_to permit(:destroy) }
    end

    context 'for project moderator' do
      let(:user) { create(:project_moderator) }

      it { is_expected.not_to permit(:show) }
      it { is_expected.not_to permit(:create) }
      it { is_expected.not_to permit(:destroy) }
    end

    context 'for admin' do
      let(:user) { create(:admin) }

      context 'when the user is the uploader' do
        it { is_expected.to permit(:show) }
        it { is_expected.to permit(:create) }
        it { is_expected.to permit(:destroy) }
      end

      context 'when the user is not the uploader' do
        let(:file) { create(:file) }

        it { is_expected.to permit(:show) }
        it { is_expected.not_to permit(:create) }
        it { is_expected.to permit(:destroy) }
      end
    end
  end

  describe 'scope' do
    subject { described_class::Scope.new(user, Files::File).resolve }

    let_it_be(:files) { create_list(:file, 2) }

    context 'for visitor' do
      let(:user) { nil }

      it { is_expected.to be_empty }
    end

    context 'for user' do
      let(:user) { create(:user) }

      it { is_expected.to be_empty }
    end

    context 'for project moderator' do
      let(:user) { create(:project_moderator) }

      it { is_expected.to be_empty }
    end

    context 'for admin' do
      let(:user) { create(:admin) }

      its(:ids) { is_expected.to match_array(files.map(&:id)) }
    end
  end
end
