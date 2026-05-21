# frozen_string_literal: true

require 'rails_helper'
require_relative '../../fixtures/sample_data'

RSpec.describe DecidimImporter::Importer do
  # Convert a [header, *data] sheet into the array-of-hashes the importer expects.
  def sheet_to_rows(sheet)
    header, *data = sheet
    data.map { |row| header.zip(row).to_h }
  end

  let(:rows_by_model) { DecidimImporter::SampleData.all.transform_values { |s| sheet_to_rows(s) } }

  def find_project(title)
    Project.where("title_multiloc->>'fr-FR' = ?", title).first
  end

  describe '#import' do
    it 'applies the base scaffold (users, folders, projects, phases) through the deserializer' do
      importer = described_class.new(rows_by_model)
      importer.import

      # Users: only the two confirmed, non-deleted accounts.
      expect(User.where(unique_code: %w[decidim_users-1 decidim_users-2]).count).to eq(2)
      expect(User.find_by(unique_code: 'decidim_users-3')).to be_nil # deleted
      expect(User.find_by(unique_code: 'decidim_users-4')).to be_nil # unconfirmed

      marie = User.find_by(unique_code: 'decidim_users-1')
      expect(marie.locale).to eq('fr-FR')
      expect(marie.admin?).to be(true)
      expect(marie.custom_field_values['gender']).to eq('female')
      expect(marie.bio_multiloc['fr-FR']).to include('marie.example.fr')

      # Folder + nested project.
      folder = ProjectFolders::Folder.where("title_multiloc->>'fr-FR' = ?", 'Environnement').first
      expect(folder).to be_present

      pb = find_project('Budget participatif 2021')
      expect(pb.admin_publication.publication_status).to eq('published')
      expect(pb.admin_publication.parent.publication).to eq(folder)

      # Phases imported as information, missing-dates step skipped + reported.
      phases = pb.phases.order(:start_at)
      expect(phases.count).to eq(2)
      expect(phases.map(&:participation_method).uniq).to eq(%w[information])
      expect(importer.skipped_phases.map { |s| s[:id] }).to include('1002')

      # Project without a group stays out of any folder; an unpublished process maps to draft.
      pm = find_project('Concertation mobilité')
      expect(pm.admin_publication.publication_status).to eq('draft')
      expect(pm.admin_publication.parent).to be_nil
    end

    it 'assigns project moderator roles after deserialization' do
      described_class.new(rows_by_model).import

      henri = User.find_by(unique_code: 'decidim_users-2')
      pb = find_project('Budget participatif 2021')
      expect(henri.project_moderator?(pb.id)).to be(true)
    end
  end

  describe '.from_files' do
    it 'parses xlsx files and imports them' do
      xlsx_service = XlsxService.new
      files = DecidimImporter::SampleData.all.to_h do |model, sheet|
        stream = xlsx_service.xlsx_from_rows(sheet)
        tempfile = Tempfile.new([model.to_s, '.xlsx'])
        tempfile.binmode
        tempfile.write(stream.read)
        tempfile.rewind
        [model, tempfile.path]
      end

      importer = described_class.from_files(files)
      expect { importer.import }.to change(Project, :count).by(2)
    end
  end
end
