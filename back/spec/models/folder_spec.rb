# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ProjectFolders::Folder do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:project_folder)).to be_valid
    end
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
  end
end
