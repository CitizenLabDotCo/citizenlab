# frozen_string_literal: true

require 'rails_helper'
require 'tempfile'
require_relative '../../fixtures/decidim_export_fixture'

RSpec.describe DecidimImporter::Importer do
  let(:export_root) { DecidimImporter::DecidimExportFixture.csv_root }

  describe '.from_directory' do
    it 'scans the known Decidim CSVs out of the export directory' do
      importer = described_class.from_directory(export_root)
      template = importer.build_template.models['models']

      expect(template.keys).to include('user', 'project_folders/folder')
      expect(template['project_folders/folder'].size).to eq(2)
      # Fixture has 108 user rows; the unconfirmed account (decidim-user-131) must be skipped.
      expect(template['user'].size).to eq(107)
      expect(template['user'].map { |u| u['unique_code'] }).not_to include('decidim-user-131')
    end

    it 'adds a custom field for each enabled extra user field from the organization config' do
      template = described_class.from_directory(export_root).build_template.models['models']
      # The org enables `phone_number` (gender is a built-in, so not recreated).
      phone = template['custom_field'].find { |cf| cf['key'] == 'phone_number' }
      expect(phone).to include('resource_type' => 'User', 'input_type' => 'text')
    end

    it 'builds the app-config patch from the organization CSV' do
      patch = described_class.from_directory(export_root).app_config_patch
      expect(patch.dig('settings', 'core', 'locales')).to eq(%w[fr-FR en])
      expect(patch.dig('settings', 'core', 'organization_name')).to include('en' => 'Raynor, Heathcote and Moen')
    end
  end

  describe '#import' do
    it 'applies users, folders, the process project and its phases through the deserializer' do
      # The export's image URLs are `http://localhost/...` (Decidim dev instance), which CarrierWave
      # refuses to fetch. Skip image fetching for the test; production imports point at reachable
      # hosts.
      described_class.from_directory(export_root, import_images: false).import

      expect(ProjectFolders::Folder.count).to eq(2)
      admin = User.find_by(unique_code: 'decidim-user-1')
      expect(admin).to be_present
      expect(admin.admin?).to be(true)
      expect(admin.locale).to eq('en')
      expect(User.find_by(unique_code: 'decidim-user-131')).to be_nil # unconfirmed

      project = Project.find_by("title_multiloc->>'fr-FR' = 'Rue de demain'")
      expect(project).to be_present
      # Process references group `decidim-participatoryprocessgroup-1` (fr title "Ipsa at non.").
      parent_folder = ProjectFolders::Folder.find_by("title_multiloc->>'fr-FR' = 'Ipsa at non.'")
      expect(project.admin_publication.parent.publication).to eq(parent_folder)
      expect(project.phases.pluck(:participation_method)).to eq(%w[information information])
    end

    it 'creates the extra user custom field and populates its value from extended_data' do
      described_class.from_directory(export_root, import_images: false).import

      field = CustomField.registration.find_by(key: 'phone_number')
      expect(field).to be_present
      expect(field.input_type).to eq('text')
      admin = User.find_by(unique_code: 'decidim-user-1')
      expect(admin.custom_field_values['phone_number']).to eq('+33124124124')
    end
  end

  describe '.apply_template_file' do
    # The dump → import split: dump the template to a file, then import that file independently of
    # the CSV pipeline.
    it 'imports a dumped tenant-template YAML file into the tenant' do
      yaml = described_class.from_directory(export_root).to_yaml
      file = Tempfile.new(['decidim', '.template.yml'])
      file.write(yaml)
      file.close

      described_class.apply_template_file(file.path, import_images: false)

      expect(ProjectFolders::Folder.count).to eq(2)
      expect(User.where(unique_code: %w[decidim-user-1]).count).to eq(1)
      expect(CustomField.registration.find_by(key: 'phone_number')).to be_present
    ensure
      file&.unlink
    end
  end
end
