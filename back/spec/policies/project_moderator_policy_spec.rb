require 'rails_helper'

describe ProjectModeratorPolicy do
  subject { described_class.new(user, record) }

  let!(:space) { create(:space) }
  let!(:other_space) { create(:space) }

  let!(:project) { create(:project, space: space) }
  let!(:other_project) { create(:project, space: other_space) }
  let!(:folder) { create(:project_folder, projects: [project]) }
  let!(:unrelated_folder) { create(:project_folder) }

  let(:record) { project }

  shared_examples 'all actions not permitted' do
    it { is_expected.not_to permit(:index) }
    it { is_expected.not_to permit(:show) }
    it { is_expected.not_to permit(:create) }
    it { is_expected.not_to permit(:destroy) }
  end

  shared_examples 'all actions permitted' do
    it { is_expected.to permit(:index) }
    it { is_expected.to permit(:show) }
    it { is_expected.to permit(:create) }
    it { is_expected.to permit(:destroy) }
  end

  context 'for an admin' do
    let(:user) { create(:admin) }

    it_behaves_like 'all actions permitted'
  end

  context "for a space moderator of the project's space" do
    let(:user) { create(:user, roles: [{ type: 'space_moderator', space_id: space.id }]) }

    it_behaves_like 'all actions permitted'
  end

  context 'for a space moderator of an unrelated space' do
    let(:user) { create(:user, roles: [{ type: 'space_moderator', space_id: other_space.id }]) }

    it_behaves_like 'all actions not permitted'
  end

  context "for a folder moderator of the project's folder" do
    let(:user) { create(:user, roles: [{ type: 'project_folder_moderator', project_folder_id: folder.id }]) }

    it_behaves_like 'all actions permitted'
  end

  context 'for a folder moderator of an unrelated folder' do
    let(:user) { create(:user, roles: [{ type: 'project_folder_moderator', project_folder_id: unrelated_folder.id }]) }

    it_behaves_like 'all actions not permitted'
  end

  context 'for a project moderator of the project' do
    let(:user) { create(:user, roles: [{ type: 'project_moderator', project_id: project.id }]) }

    it { is_expected.to permit(:index) }
    it { is_expected.to permit(:show) }
    it { is_expected.to permit(:create) }
    it { is_expected.not_to permit(:destroy) }
  end

  context 'for a project moderator of another project' do
    let(:user) { create(:user, roles: [{ type: 'project_moderator', project_id: other_project.id }]) }

    it_behaves_like 'all actions not permitted'
  end

  context 'for a resident' do
    let(:user) { create(:user) }

    it_behaves_like 'all actions not permitted'
  end
end
