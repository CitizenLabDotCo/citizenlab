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

  describe 'scheduled transition validations' do
    let(:user) { create(:user) }

    it 'is valid with all scheduling fields set' do
      admin_publication.assign_attributes(
        scheduled_status: 'archived', scheduled_at: 1.hour.from_now, scheduled_by: user
      )
      expect(admin_publication).to be_valid
    end

    it 'is invalid when scheduled_by is missing' do
      admin_publication.assign_attributes(scheduled_status: 'archived', scheduled_at: 1.hour.from_now)
      expect(admin_publication).not_to be_valid
      expect(admin_publication.errors[:scheduled_by]).to be_present
    end

    it 'is invalid when only one scheduled field is set' do
      admin_publication.scheduled_status = 'archived'
      expect(admin_publication).not_to be_valid
      expect(admin_publication.errors[:scheduled_at]).to be_present

      admin_publication.reload

      admin_publication.scheduled_at = 1.hour.from_now
      expect(admin_publication).not_to be_valid
      expect(admin_publication.errors[:scheduled_status]).to be_present
    end

    it 'is invalid when scheduled_status equals current publication_status' do
      admin_publication.assign_attributes(
        scheduled_status: 'published', scheduled_at: 1.hour.from_now, scheduled_by: user
      )
      expect(admin_publication).not_to be_valid
      expect(admin_publication.errors[:scheduled_status]).to be_present
    end

    it 'is invalid with an unrecognized scheduled_status' do
      admin_publication.assign_attributes(
        scheduled_status: 'bogus', scheduled_at: 1.hour.from_now, scheduled_by: user
      )
      expect(admin_publication).not_to be_valid
    end

    it 'is invalid when scheduled_at is in the past' do
      admin_publication.assign_attributes(
        scheduled_status: 'archived', scheduled_at: 1.hour.ago, scheduled_by: user
      )
      expect(admin_publication).not_to be_valid
      expect(admin_publication.errors[:scheduled_at]).to be_present
    end
  end

  describe 'cancel schedule on manual status change' do
    let(:user) { create(:user) }

    it 'clears scheduled fields when publication_status is changed directly' do
      admin_publication.update!(
        scheduled_status: 'archived', scheduled_at: 1.hour.from_now, scheduled_by: user
      )
      admin_publication.update!(publication_status: 'draft')
      expect(admin_publication.scheduled_status).to be_nil
      expect(admin_publication.scheduled_at).to be_nil
      expect(admin_publication.scheduled_by).to be_nil
    end

    it 'preserves scheduled fields when other attributes change' do
      admin_publication.update!(
        scheduled_status: 'archived', scheduled_at: 1.hour.from_now, scheduled_by: user
      )
      admin_publication.update!(ordering: 5)
      expect(admin_publication.scheduled_status).to eq('archived')
      expect(admin_publication.scheduled_by).to eq(user)
    end
  end

  describe '#published?' do
    it 'reflects effective status for a due schedule' do

      admin_publication.update_columns(publication_status: 'draft', scheduled_status: 'published', scheduled_at: 1.hour.ago)
      admin_publication.reload
      expect(admin_publication).to be_published
    end

    it 'ignores future schedule' do

      admin_publication.update_columns(scheduled_status: 'draft', scheduled_at: 1.hour.from_now)
      admin_publication.reload
      expect(admin_publication).to be_published
    end
  end

  describe '#draft?' do
    it 'reflects effective status for a due schedule' do

      admin_publication.update_columns(scheduled_status: 'draft', scheduled_at: 1.hour.ago)
      admin_publication.reload
      expect(admin_publication).to be_draft
    end
  end

  describe '#archived?' do
    it 'reflects effective status for a due schedule' do

      admin_publication.update_columns(scheduled_status: 'archived', scheduled_at: 1.hour.ago)
      admin_publication.reload
      expect(admin_publication).to be_archived
    end
  end

  describe '.published' do
    it 'includes due schedule targeting published, excludes due schedule away from published' do

      becoming_published = create(:admin_publication)
      becoming_published.update_columns(publication_status: 'draft', scheduled_status: 'published', scheduled_at: 1.hour.ago)

      leaving_published = create(:admin_publication)
      leaving_published.update_columns(publication_status: 'published', scheduled_status: 'draft', scheduled_at: 1.hour.ago)

      expect(described_class.published).to include(becoming_published)
      expect(described_class.published).not_to include(leaving_published)
    end

    it 'uses stored status when schedule is in the future' do

      admin_publication.update_columns(scheduled_status: 'draft', scheduled_at: 1.hour.from_now)
      expect(described_class.published).to include(admin_publication)
    end
  end

  describe '.draft' do
    it 'includes due schedule targeting draft, excludes due schedule away from draft' do

      becoming_draft = create(:admin_publication)
      becoming_draft.update_columns(publication_status: 'published', scheduled_status: 'draft', scheduled_at: 1.hour.ago)

      leaving_draft = create(:admin_publication)
      leaving_draft.update_columns(publication_status: 'draft', scheduled_status: 'published', scheduled_at: 1.hour.ago)

      expect(described_class.draft).to include(becoming_draft)
      expect(described_class.draft).not_to include(leaving_draft)
    end
  end

  describe '.not_draft' do
    it 'excludes due schedule targeting draft, includes due schedule away from draft' do

      becoming_draft = create(:admin_publication)
      becoming_draft.update_columns(publication_status: 'published', scheduled_status: 'draft', scheduled_at: 1.hour.ago)

      leaving_draft = create(:admin_publication)
      leaving_draft.update_columns(publication_status: 'draft', scheduled_status: 'published', scheduled_at: 1.hour.ago)

      expect(described_class.not_draft).not_to include(becoming_draft)
      expect(described_class.not_draft).to include(leaving_draft)
    end
  end

  describe '.sorted_by_title_multiloc' do
    let(:user) { create(:user, locale: 'en') }
    let!(:project1) { create(:project, title_multiloc: { en: 'Bravo' }) }
    let!(:project2) { create(:project, title_multiloc: { en: 'Alpha' }) }
    let!(:folder1)  { create(:project_folder, title_multiloc: { en: 'Charlie', 'fr-FR': 'Gamma' }) }
    let!(:project3) { create(:project, title_multiloc: { en: '', 'fr-FR': 'Echo' }) }
    let!(:folder2)  { create(:project_folder, title_multiloc: { 'nl-NL': 'Omega', 'fr-FR': 'Delta' }) }

    let(:expected_ascending_order) do
      [
        project2.title_multiloc,   # Alpha
        project1.title_multiloc,   # Bravo
        folder1.title_multiloc,    # Charlie
        folder2.title_multiloc,    # Delta (no en, falls back to fr)
        project3.title_multiloc    # Echo (en is blank, falls back to fr because fr-FR is before nl-NL in tenant locales)
      ]
    end

    it 'sorts admin publications by multiloc title ascending (with locale fallback)' do
      expect(AppConfiguration.instance.settings('core', 'locales')).to eq %w[en fr-FR nl-NL]

      sorted = described_class.sorted_by_title_multiloc(user, 'ASC')
      expect(sorted.map { |ap| ap.publication.title_multiloc })
        .to eq expected_ascending_order
    end

    it 'sorts admin publications by multiloc title descending (with locale fallback)' do
      sorted = described_class.sorted_by_title_multiloc(user, 'DESC')
      expect(sorted.map { |ap| ap.publication.title_multiloc })
        .to eq expected_ascending_order.reverse
    end
  end
end
