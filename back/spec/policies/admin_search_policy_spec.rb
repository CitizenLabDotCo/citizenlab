# frozen_string_literal: true

require 'rails_helper'

describe AdminSearchPolicy do
  subject { described_class.new(user, :admin_search) }

  context 'for a visitor' do
    let(:user) { nil }

    it { is_expected.not_to permit(:index) }
  end

  context 'for a resident' do
    let(:user) { create(:user) }

    it { is_expected.not_to permit(:index) }
  end

  context 'for an admin' do
    let(:user) { create(:admin) }

    it { is_expected.to permit(:index) }
  end

  context 'for a project moderator' do
    let(:user) { create(:project_moderator) }

    it { is_expected.to permit(:index) }
  end

  context 'for a folder moderator' do
    let(:user) { create(:project_folder_moderator) }

    it { is_expected.to permit(:index) }
  end

  context 'for a space moderator' do
    let(:user) { create(:space_moderator) }

    it { is_expected.to permit(:index) }
  end

  context 'for a blocked admin' do
    let(:user) { create(:admin, block_end_at: 5.days.from_now) }

    it { is_expected.not_to permit(:index) }
  end
end
