# frozen_string_literal: true

require 'rails_helper'

describe PermissionsCustomFieldPolicy do
  subject { described_class.new(user, permissions_custom_field) }

  let(:project) { create(:continuous_project) }
  let(:permission) { create(:permission, permission_scope: project) }
  let(:permissions_custom_field) { create(:permissions_custom_field, permission: permission) }

  context 'for a visitor' do
    let(:user) { nil }

    it { is_expected.not_to permit(:index) }
    it { is_expected.not_to permit(:show) }
    it { is_expected.not_to permit(:create) }
    it { is_expected.not_to permit(:update) }
    it { is_expected.not_to permit(:destroy) }
  end

  context 'for a resident' do
    let(:user) { create(:user) }

    it { is_expected.not_to permit(:index) }
    it { is_expected.not_to permit(:show) }
    it { is_expected.not_to permit(:create) }
    it { is_expected.not_to permit(:update) }
    it { is_expected.not_to permit(:destroy) }
  end

  context 'for a project moderator' do
    let(:user) { create(:project_moderator, projects: [project]) }

    it { is_expected.to permit(:index) }
    it { is_expected.to permit(:show) }
    it { is_expected.to permit(:create) }
    it { is_expected.to permit(:update) }
    it { is_expected.to permit(:destroy) }
  end

  context 'for an admin' do
    let(:user) { create(:admin) }

    it { is_expected.to permit(:index) }
    it { is_expected.to permit(:show) }
    it { is_expected.to permit(:create) }
    it { is_expected.to permit(:update) }
    it { is_expected.to permit(:destroy) }
  end
end
