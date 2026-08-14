# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ProjectFolders::Folder do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:project_folder)).to be_valid
    end
  end

  it { is_expected.to validate_presence_of(:title_multiloc) }

  it { is_expected.to belong_to(:space).optional }

  it 'validates presence of slug' do
    folder = build(:project_folder)
    allow(folder).to receive(:generate_slug) # Stub to do nothing
    folder.slug = nil
    expect(folder).to be_invalid
    expect(folder.errors[:slug]).to include("can't be blank")
  end

  describe 'Folder without admin publication' do
    it 'is invalid' do
      folder = create(:project_folder)
      AdminPublication.where(publication: folder).first.destroy!
      expect(folder.reload).to be_invalid
    end
  end

  describe 'generate_slug' do
    let(:folder) { build(:project_folder, slug: nil) }

    it 'generates a slug based on the first non-empty locale' do
      folder.update!(title_multiloc: { 'en' => 'my folder', 'nl-BE' => 'mijn map', 'fr-BE' => 'mon dossier' })
      expect(folder.slug).to eq 'my-folder'
    end

    it 'generates a slug from the sanitized title, not the raw one' do
      folder.update!(title_multiloc: { 'en' => '<b>Bold</b> folder' })
      expect(folder.slug).to eq 'bold-folder'
    end
  end

  it_behaves_like 'a sanitized title_multiloc', factory: :project_folder

  it_behaves_like 'a sanitized html_multiloc', factory: :project_folder
  it_behaves_like 'a sanitized html_multiloc', factory: :project_folder, attribute: :description_preview_multiloc
end
