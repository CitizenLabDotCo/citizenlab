# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ProjectFolders::Folder do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:project_folder)).to be_valid
    end
  end

  it { is_expected.to validate_presence_of(:title_multiloc) }

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
  end

  describe '#sanitize_description_multiloc' do
    it 'sanitizes script tags in the description' do
      folder = create(:project_folder, description_multiloc: {
        'en' => '<p>Test</p><script>These tags should be removed!</script>'
      })
      expect(folder.description_multiloc).to eq({ 'en' => '<p>Test</p>These tags should be removed!' })
    end
  end

  describe '#sanitize_description_preview_multiloc' do
    it 'sanitizes script tags in the description_preview_multiloc' do
      folder = create(:project_folder, description_preview_multiloc: {
        'en' => '<p>Test</p><script>These tags should be removed!</script>'
      })
      expect(folder.description_preview_multiloc).to eq({ 'en' => '<p>Test</p>These tags should be removed!' })
    end
  end
end
