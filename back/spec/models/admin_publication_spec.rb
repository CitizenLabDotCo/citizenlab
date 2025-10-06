# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AdminPublication do
  subject(:admin_publication) { create(:admin_publication) }

  describe 'create(:admin_publication)' do
    it 'is valid' do
      expect(admin_publication).to be_valid
    end
  end

  describe '#depth' do
    it 'sets depth of 0 by default' do
      expect(admin_publication.depth).to eq 0
    end

    it 'sets depth of 1 to a direct child' do
      admin_publication = create(:admin_publication, publication: create(:idea))
      child_publication = create(:admin_publication)
      admin_publication.children << child_publication
      admin_publication.save

      expect(child_publication.depth).to eq 1
    end
  end

  describe '#children_allowed?' do
    it 'is true by default for a publication that is not a project' do
      publication = create(:admin_publication, publication: create(:idea))
      expect(publication.children_allowed?).to be true
    end

    it 'is false for a project' do
      expect(admin_publication.children_allowed?).to be false
    end

    it 'allows the creation of children for a non project admin publication' do
      admin_publication = create(:admin_publication, publication: create(:idea))
      child_publication = create(:admin_publication)
      admin_publication.children << child_publication
      expect(admin_publication).to be_valid
    end

    it 'does not allow the creation of children for a project admin publication' do
      child_publication = create(:admin_publication)
      admin_publication.children << child_publication
      expect(child_publication).not_to be_valid
    end
  end

  describe '.sorted_by_title_multiloc' do
    let(:user) { create(:user, locale: 'en') }
    let!(:project1) { create(:project, title_multiloc: { en: 'Bravo' }) }
    let!(:project2) { create(:project, title_multiloc: { en: 'Alpha' }) }
    let!(:folder1)  { create(:project_folder, title_multiloc: { en: 'Charlie', 'fr-FR': 'CharlieFR' }) }
    let!(:project3) { create(:project, title_multiloc: { en: '', 'fr-FR': 'EchoFR' }) }
    let!(:folder2)  { create(:project_folder, title_multiloc: { 'nl-NL': 'Gamma', 'fr-FR': 'DeltaFR' }) }

    let(:expected_ascending_order) do
      [
        project2.title_multiloc,   # Alpha
        project1.title_multiloc,   # Bravo
        folder1.title_multiloc,    # Charlie
        folder2.title_multiloc,    # DeltaFR (no en, falls back to fr)
        project3.title_multiloc    # EchoFR (en is blank, falls back to fr because fr-FR is before nl-NL in tenant locales)
      ]
    end

    it 'sorts admin publications by multiloc title ascending (with locale fallback)' do
      expect(AppConfiguration.instance.settings('core', 'locales')).to eq %w[en fr-FR nl-NL]

      sorted = AdminPublication.sorted_by_title_multiloc(user, 'ASC')
      expect(sorted.map { |ap| ap.publication.title_multiloc })
        .to eq expected_ascending_order
    end

    it 'sorts admin publications by multiloc title descending (with locale fallback)' do
      sorted = AdminPublication.sorted_by_title_multiloc(user, 'DESC')
      expect(sorted.map { |ap| ap.publication.title_multiloc })
        .to eq expected_ascending_order.reverse
    end
  end
end
