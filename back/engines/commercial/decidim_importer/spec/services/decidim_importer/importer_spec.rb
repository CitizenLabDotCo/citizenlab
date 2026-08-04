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

      described_class.apply_template_file(file.path, import_uploads: false)

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

  describe '.provision_project_pages!' do
    let(:stale) { { 'ROOT' => { 'type' => 'div', 'isCanvas' => true, 'nodes' => [], 'props' => {} } } }

    def project_page(project)
      ContentBuilder::Layout.find_by(content_buildable: project, code: 'project_page')
    end

    it 'gives an imported project without a page a default one, leaving existing pages untouched' do
      without_page = create(:project)
      imported = create(:project)
      other = create(:project) # e.g. a pre-existing demo project, not part of the import
      imported_page = ContentBuilder::Layout.create!(
        content_buildable: imported, code: 'project_page', enabled: true, craftjs_json: stale
      )
      other_page = ContentBuilder::Layout.create!(
        content_buildable: other, code: 'project_page', enabled: true, craftjs_json: stale
      )

      described_class.provision_project_pages!('Project' => [without_page.id, imported.id])

      # the project the extractor built no page for gets the canonical default one
      expect(project_page(without_page).craftjs_json).to include('PROJECT_PAGE_BODY')
      # the page the extractor imported is kept as-is
      expect(project_page(imported)).to eq(imported_page)
      expect(imported_page.reload.craftjs_json).to eq(stale)
      # the non-imported project is left exactly as it was
      expect(project_page(other)).to eq(other_page)
      expect(other_page.reload.craftjs_json).to eq(stale)
    end

    it 'is a no-op when the import created no projects' do
      expect { described_class.provision_project_pages!({}) }.not_to raise_error
    end
  end

  describe '.merge_app_config_locales_file' do
    def app_config_json(locales)
      file = Tempfile.new(['decidim', '.app_config.json'])
      file.write({ 'settings' => { 'core' => { 'locales' => locales } } }.to_json)
      file.close
      file
    end

    it 'adds the export locales the tenant lacks, keeping its existing ones (additive union)' do
      existing = AppConfiguration.instance.settings('core', 'locales')
      missing = (CL2_SUPPORTED_LOCALES.map(&:to_s) - existing).first
      file = app_config_json([missing] + existing) # order in the patch shouldn't drop the tenant's own

      added = described_class.merge_app_config_locales_file(file.path)

      expect(added).to eq([missing])
      locales = AppConfiguration.instance.reload.settings('core', 'locales')
      expect(locales).to include(*existing, missing) # existing kept, missing appended — nothing replaced
    ensure
      file&.unlink
    end

    it 'returns [] and changes nothing when the tenant already has every export locale' do
      file = app_config_json([AppConfiguration.instance.settings('core', 'locales').first])
      expect(described_class.merge_app_config_locales_file(file.path)).to eq([])
    ensure
      file&.unlink
    end

    it 'is a no-op returning [] when the file is absent' do
      expect(described_class.merge_app_config_locales_file('/no/such.app_config.json')).to eq([])
    end
  end

  describe '.apply_app_config_file' do
    it 'deep-merges the patch settings into the tenant AppConfiguration' do
      file = Tempfile.new(['decidim', '.app_config.json'])
      file.write({ 'settings' => { 'core' => { 'organization_name' => { 'en' => 'Imported City' } } } }.to_json)
      file.close

      applied = described_class.apply_app_config_file(file.path, import_uploads: false)

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
