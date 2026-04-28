require 'rails_helper'

RSpec.describe Space do
  describe 'Default factory' do
    subject(:space) { build(:space) }

    it { is_expected.to be_valid }

    describe 'validations' do
      it { is_expected.to validate_presence_of(:title_multiloc) }

      it 'is invalid when title_multiloc is empty' do
        space = build(:space, title_multiloc: {})
        expect(space).to be_invalid
        expect(space.errors[:title_multiloc]).to be_present
      end

      it 'is valid when description_multiloc is empty' do
        space = build(:space, description_multiloc: {})
        expect(space).to be_valid
      end
    end

    describe 'associations' do
      it { is_expected.to have_many(:projects).dependent(:nullify) }
      it { is_expected.to have_many(:folders).dependent(:nullify) }
    end

    describe 'destroying a space' do
      it 'nullifies space_id on associated projects' do
        space = create(:space)
        project = create(:project, space: space)

        space.destroy

        expect(project.reload.space_id).to be_nil
        expect(Project.exists?(project.id)).to be true
      end

      it 'does not destroy projects when space is destroyed' do
        space = create(:space)
        create(:project, space: space)

        expect { space.destroy }.not_to change(Project, :count)
      end

      it 'nullifies space_id on associated folders' do
        space = create(:space)
        folder = create(:project_folder, space: space)

        space.destroy

        expect(folder.reload.space_id).to be_nil
        expect(ProjectFolders::Folder.exists?(folder.id)).to be true
      end

      it 'does not destroy folders when space is destroyed' do
        space = create(:space)
        create(:project_folder, space: space)

        expect { space.destroy }.not_to change(ProjectFolders::Folder, :count)
      end
    end
  end
end
