require 'rails_helper'

describe SpacePolicy do
  subject { described_class.new(user, space) }

  let(:space) { create(:space) }

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
    let(:user) do
      project = create(:project)
      user = create(:user)
      user.add_role('project_moderator', project_id: project.id)
      user
    end

    it { is_expected.not_to permit(:index) }
    it { is_expected.to permit(:show) }
    it { is_expected.not_to permit(:create) }
    it { is_expected.not_to permit(:update) }
    it { is_expected.not_to permit(:destroy) }
  end

  context 'for a space moderator' do
    let(:user) do
      user = create(:user)
      user.add_role('space_moderator', space_id: space.id)
      user
    end

    it { is_expected.to permit(:index) }
    it { is_expected.to permit(:show) }
    it { is_expected.not_to permit(:create) }
    it { is_expected.to permit(:update) }
    it { is_expected.not_to permit(:destroy) }
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
