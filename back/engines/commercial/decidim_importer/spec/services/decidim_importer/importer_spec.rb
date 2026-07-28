# frozen_string_literal: true

require 'rails_helper'
require 'tempfile'
require_relative '../../fixtures/decidim_export_fixture'

RSpec.describe DecidimImporter::Importer do
  let(:export_root) { DecidimImporter::DecidimExportFixture.csv_root }

  # The imported proposals land in ideation phases, so the tenant needs the matching ideation
  # idea_statuses (a real tenant seeds these at creation; resolve them by code at apply time).
  before do
    %w[proposed under_consideration accepted rejected].each do |code|
      next if IdeaStatus.exists?(code: code, participation_method: 'ideation')

      create(:idea_status, code: code, participation_method: 'ideation')
    end
  end

  describe '.apply_template_file' do
    # The create → import split: dump the template to a file, then import that file independently of
    # the CSV pipeline.
    it 'imports a dumped tenant-template YAML file into the tenant' do
      yaml = DecidimImporter::TemplateCreator.from_directory(export_root).to_yaml
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

  describe '.resolve_area_orderings!' do
    it "offsets imported area orderings past the tenant's existing areas" do
      create(:area)
      base = Area.maximum(:ordering) + 1
      template = { 'models' => { 'area' => [{ 'ordering' => 0 }, { 'ordering' => 3 }] } }

      described_class.resolve_area_orderings!(template)

      expect(template['models']['area'].map { |a| a['ordering'] }).to eq([base, base + 3])
    end

    it 'is a no-op when there are no areas in the template' do
      expect { described_class.resolve_area_orderings!({ 'models' => {} }) }.not_to raise_error
    end
  end

  describe '.apply_app_config_file' do
    it 'deep-merges the patch settings into the tenant AppConfiguration' do
      file = Tempfile.new(['decidim', '.app_config.json'])
      file.write({ 'settings' => { 'core' => { 'organization_name' => { 'en' => 'Imported City' } } } }.to_json)
      file.close

      applied = described_class.apply_app_config_file(file.path, import_images: false)

      expect(applied).to be(true)
      # Deep-merge: the imported locale overrides en, the tenant's other settings are preserved.
      expect(AppConfiguration.instance.settings('core', 'organization_name')).to include('en' => 'Imported City')
    ensure
      file&.unlink
    end

    it 'is a no-op returning false when the file is absent' do
      expect(described_class.apply_app_config_file('/no/such.app_config.json')).to be(false)
    end

    it 'replaces the tenant locales with the imported ones, migrating users off dropped locales' do
      # The default tenant supports several locales (incl. fr-FR); importing only 'en' drops the rest.
      expect(AppConfiguration.instance.settings('core', 'locales')).to include('fr-FR')
      user = create(:user, locale: 'fr-FR')

      described_class.apply_app_config({ 'settings' => { 'core' => { 'locales' => ['en'] } } })

      expect(AppConfiguration.instance.settings('core', 'locales')).to eq(['en'])
      expect(user.reload.locale).to eq('en') # migrated to the first new locale
    end
  end
end
