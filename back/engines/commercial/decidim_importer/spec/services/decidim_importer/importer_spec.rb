# frozen_string_literal: true

require 'rails_helper'
require_relative '../../fixtures/decidim_export_fixture'

RSpec.describe DecidimImporter::Importer do
  let(:zip_path) { DecidimImporter::DecidimExportFixture.zip_path }

  describe '.from_zip' do
    it 'unzips and scans known Decidim CSVs out of the export' do
      importer = described_class.from_zip(zip_path)
      template = importer.build_template.models['models']

      expect(template.keys).to include('user', 'project_folders/folder')
      expect(template['project_folders/folder'].size).to eq(2)
      # Real fixture has 108 rows; the unconfirmed account (decidim-user-131) must be skipped.
      expect(template['user'].size).to eq(107)
      expect(template['user'].map { |u| u['unique_code'] }).not_to include('decidim-user-131')
    end

    it 'raises when the zip path does not exist' do
      expect { described_class.from_zip('/nope.zip') }.to raise_error(ArgumentError, /not found/)
    end
  end

  describe '#import' do
    it 'applies users and folders from the real Decidim export through the deserializer' do
      # The export's image URLs are `http://localhost/...` (Decidim dev instance), which CarrierWave
      # refuses to fetch. Skip image fetching for the test; production imports point at reachable
      # hosts.
      described_class.from_zip(zip_path, import_images: false).import

      expect(ProjectFolders::Folder.count).to eq(2)
      admin = User.find_by(unique_code: 'decidim-user-1')
      expect(admin).to be_present
      expect(admin.admin?).to be(true)
      expect(admin.locale).to eq('en')
      expect(User.find_by(unique_code: 'decidim-user-131')).to be_nil # unconfirmed
    end
  end
end
