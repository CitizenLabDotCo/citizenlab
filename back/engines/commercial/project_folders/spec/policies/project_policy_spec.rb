require 'rails_helper'

describe ProjectPolicy do
  subject { ProjectPolicy.new(user, project) }

  context 'for a project contained within a folder the user moderates' do
    let!(:project) { create(:project, admin_publication_attributes: { parent_id: project_folder.admin_publication.id }) }
    let!(:project_folder) { create(:project_folder) }
    let(:user) { build(:project_folder_moderator, project_folders: [project_folder]) }

    it { is_expected.to permit(:create) }
  end

  context 'for a project not contained within a folder the user moderates' do
    let!(:project) { create(:project) }
    let!(:project_folder) { create(:project_folder) }
    let(:user) { build(:project_folder_moderator, project_folders: [project_folder]) }

    it { is_expected.to_not permit(:create) }
  end
end
