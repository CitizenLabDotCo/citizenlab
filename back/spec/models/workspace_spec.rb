require 'rails_helper'

RSpec.describe Workspace do
  describe 'Default factory' do
    subject(:workspace) { build(:workspace) }

    it { is_expected.to be_valid }

    describe 'validations' do
      it { is_expected.to validate_presence_of(:title_multiloc) }

      it 'is invalid when title_multiloc is empty' do
        workspace = build(:workspace, title_multiloc: {})
        expect(workspace).to be_invalid
        expect(workspace.errors[:title_multiloc]).to be_present
      end

      it 'is valid when description_multiloc is empty' do
        workspace = build(:workspace, description_multiloc: {})
        expect(workspace).to be_valid
      end
    end

    describe 'associations' do
      it { is_expected.to have_many(:projects).dependent(:nullify) }
      it { is_expected.to have_many(:folders).dependent(:nullify) }
    end

    describe 'destroying a workspace' do
      it 'nullifies workspace_id on associated projects' do
        workspace = create(:workspace)
        project = create(:project, workspace: workspace)

        workspace.destroy

        expect(project.reload.workspace_id).to be_nil
        expect(Project.exists?(project.id)).to be true
      end

      it 'does not destroy projects when workspace is destroyed' do
        workspace = create(:workspace)
        create(:project, workspace: workspace)

        expect { workspace.destroy }.not_to change(Project, :count)
      end

      it 'nullifies workspace_id on associated folders' do
        workspace = create(:workspace)
        folder = create(:project_folder, workspace: workspace)

        workspace.destroy

        expect(folder.reload.workspace_id).to be_nil
        expect(ProjectFolders::Folder.exists?(folder.id)).to be true
      end

      it 'does not destroy folders when workspace is destroyed' do
        workspace = create(:workspace)
        create(:project_folder, workspace: workspace)

        expect { workspace.destroy }.not_to change(ProjectFolders::Folder, :count)
      end
    end
  end
end
