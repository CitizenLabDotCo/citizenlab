require 'rails_helper'

describe ProjectModeratorPolicy do
  subject { described_class.new(user, record) }

  # Reference the Moderator struct from the controller for consistency
  let(:moderator_struct) { WebApi::V1::ProjectModeratorsController::Moderator }

  let!(:project) { create(:project) }
  let!(:other_project) { create(:project) }
  let!(:folder) { create(:project_folder, projects: [project]) }
  let!(:unrelated_folder) { create(:project_folder) }

  let(:admin) { create(:admin) }
  let(:folder_moderator) { create(:user, roles: [{ type: 'project_folder_moderator', project_folder_id: folder.id }]) }
  let(:unrelated_folder_moderator) { create(:user, roles: [{ type: 'project_folder_moderator', project_folder_id: unrelated_folder.id }]) }
  let(:project_moderator) { create(:user, roles: [{ type: 'project_moderator', project_id: project.id }]) }
  let(:other_project_moderator) { create(:user, roles: [{ type: 'project_moderator', project_id: other_project.id }]) }
  let(:resident) { create(:user) }
  let(:target_moderator) { create(:user) }

  before do
    stub_const('Moderator', moderator_struct)
  end

  shared_examples 'permits actions' do |actions|
    actions.each do |action|
      it { is_expected.to permit(action) }
    end
  end

  shared_examples 'forbids actions' do |actions|
    actions.each do |action|
      it { is_expected.not_to permit(action) }
    end
  end

  # For project-level actions (:index, :create, :users_search), the controller authorizes
  # with a Moderator struct where user_id is nil and project_id is set (see index and
  # users_search in WebApi::V1::ProjectModeratorsController). This matches how these
  # actions are authorized in the application, so the policy is tested with the same struct shape here.
  describe 'index, create, users_search (project-level actions)' do
    let(:record) { Moderator.new(nil, project.id) }

    context 'for an admin' do
      let(:user) { admin }

      it_behaves_like 'permits actions', %i[index create users_search]
    end

    context "for a folder moderator of the project's folder" do
      let(:user) { folder_moderator }

      it_behaves_like 'permits actions', %i[index create users_search]
    end

    context 'for a folder moderator of an unrelated folder' do
      let(:user) { unrelated_folder_moderator }

      it_behaves_like 'forbids actions', %i[index create users_search]
    end

    context 'for a project moderator of the project' do
      let(:user) { project_moderator }

      it_behaves_like 'permits actions', %i[index create users_search]
    end

    context 'for a project moderator of another project' do
      let(:user) { other_project_moderator }

      it_behaves_like 'forbids actions', %i[index create users_search]
    end

    context 'for a resident' do
      let(:user) { resident }

      it_behaves_like 'forbids actions', %i[index create users_search]
    end
  end

  # For :show and :destroy actions, the controller authorizes with a Moderator struct
  # where user_id is set to the target moderator's user id (see do_authorize in
  # WebApi::V1::ProjectModeratorsController). This differs from project-level actions
  # (like :index, :create, :users_search), which use Moderator.new(nil, project_id).
  # This block tests the policy with the same struct shape as the controller uses.
  describe 'show, destroy (moderator-specific actions)' do
    let(:record) { Moderator.new(target_moderator.id, project.id) }

    context 'for an admin' do
      let(:user) { admin }

      it_behaves_like 'permits actions', %i[show destroy]
    end

    context "for a folder moderator of the project's folder" do
      let(:user) { folder_moderator }

      it_behaves_like 'permits actions', %i[show destroy]
    end

    context 'for a folder moderator of unrelated folder' do
      let(:user) { unrelated_folder_moderator }

      it_behaves_like 'forbids actions', %i[show destroy]
    end

    context 'for a project moderator of the project' do
      let(:user) { project_moderator }

      it_behaves_like 'permits actions', %i[show destroy]
    end

    context 'for a project moderator of another project' do
      let(:user) { other_project_moderator }

      it_behaves_like 'forbids actions', %i[show destroy]
    end

    context 'for a resident' do
      let(:user) { resident }

      it_behaves_like 'forbids actions', %i[show destroy]
    end
  end
end
