require 'rails_helper'

describe Moderators::SpaceModeratorPolicy do
  subject { described_class.new(user, space) }

  let!(:space) { create(:space) }
  let!(:other_space) { create(:space) }

  shared_examples 'all actions not permitted' do
    it { is_expected.not_to permit(:index) }
    it { is_expected.not_to permit(:show) }
    it { is_expected.not_to permit(:create) }
    it { is_expected.not_to permit(:destroy) }
  end

  context 'for an admin' do
    let(:user) { create(:admin) }

    it { is_expected.to permit(:index) }
    it { is_expected.to permit(:show) }
    it { is_expected.to permit(:create) }
    it { is_expected.to permit(:destroy) }
  end

  context 'for a space moderator of the space' do
    let(:user) { create(:user, roles: [{ type: 'space_moderator', space_id: space.id }]) }

    it { is_expected.to permit(:index) }
    it { is_expected.to permit(:show) }
    it { is_expected.not_to permit(:create) }
    it { is_expected.not_to permit(:destroy) }
  end

  context 'for a space moderator of an unrelated space' do
    let(:user) { create(:user, roles: [{ type: 'space_moderator', space_id: other_space.id }]) }

    it_behaves_like 'all actions not permitted'
  end

  context 'for a folder moderator (of folder in space)' do
    let(:folder) { create(:project_folder, space: space) }
    let(:user) { create(:user, roles: [{ type: 'project_folder_moderator', project_folder_id: folder.id }]) }

    it_behaves_like 'all actions not permitted'
  end

  context 'for a project moderator (of project in space)' do
    let(:project) { create(:project, space: space) }
    let(:user) { create(:user, roles: [{ type: 'project_moderator', project_id: project.id }]) }

    it_behaves_like 'all actions not permitted'
  end

  context 'for residents' do
    let(:user) { create(:user) }

    it_behaves_like 'all actions not permitted'
  end
end
