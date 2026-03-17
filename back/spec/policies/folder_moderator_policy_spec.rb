require 'rails_helper'

describe FolderModeratorPolicy do
  subject { described_class.new(user, record) }

  # Reference the Moderator struct from the controller for consistency
  let(:moderator_struct) { WebApi::V1::FolderModeratorsController::Moderator }

  let!(:project) { create(:project) }
  let!(:other_project) { create(:project) }

  let!(:folder) { create(:project_folder, projects: [project]) }
  let!(:other_folder) { create(:project_folder, projects: [other_project]) }

  let!(:moderator) { create(:user, roles: [{ type: 'project_folder_moderator', project_folder_id: folder.id }]) }
  let!(:moderator_of_other_folder) { create(:user, roles: [{ type: 'project_folder_moderator', project_folder_id: other_folder.id }]) }
  let!(:admin) { create(:admin) }
  let!(:resident) { create(:user) }

  before do
    stub_const('Moderator', moderator_struct)
  end

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

  # For all actions, the controller authorizes with Moderator.new(project_folder_id)
  # (see do_authorize in WebApi::V1::FolderModeratorsController).
  context 'for an admin' do
    let(:user) { admin }
    let(:record) { Moderator.new(folder.id) }

    it_behaves_like 'all actions permitted'
  end

  context "for a folder moderator of the project's folder" do
    let(:user) { moderator }
    let(:record) { Moderator.new(folder.id) }

    it { is_expected.to permit(:index) }
    it { is_expected.to permit(:show) }
    it { is_expected.not_to permit(:create) }
    it { is_expected.not_to permit(:destroy) }
  end

  context 'for a folder moderator of another folder' do
    let(:user) { moderator_of_other_folder }
    let(:record) { Moderator.new(folder.id) }

    it_behaves_like 'all actions not permitted'
  end

  context 'for a project moderator of the project' do
    let(:user) { create(:user, roles: [{ type: 'project_moderator', project_id: project.id }]) }
    let(:record) { Moderator.new(folder.id) }

    it_behaves_like 'all actions not permitted'
  end

  context 'for a resident' do
    let(:user) { resident }
    let(:record) { Moderator.new(folder.id) }

    it_behaves_like 'all actions not permitted'
  end
end
