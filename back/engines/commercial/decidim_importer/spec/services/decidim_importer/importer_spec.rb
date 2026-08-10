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

  describe '.apply_template reuse (default on)' do
    it 'reuses a pre-existing user instead of duplicating it, resolving authors to it' do
      existing = create(:user)
      existing.update_columns(unique_code: 'decidim-user-1') # the same Decidim id the template carries
      template = YAML.load(DecidimImporter::TemplateCreator.from_directory(export_root).to_yaml, aliases: true)

      # reuse is always applied
      described_class.apply_template(template, import_uploads: false)

      # not duplicated — the pre-existing user is reused
      expect(User.where(unique_code: 'decidim-user-1').count).to eq(1)
      expect(User.find_by(unique_code: 'decidim-user-1')).to eq(existing)
      # and the proposal authored by decidim-user-1 resolves to that existing user
      accepted = Idea.find_by(title_multiloc: { 'fr-FR' => "Plus d'arbres" })
      expect(accepted.author).to eq(existing)
    end
  end

  describe "user reuse fallback by email (reuse_matchers['User'])" do
    let(:matcher) { described_class.reuse_matchers['User'] }

    it 'reuses a user created outside the import (no unique_code) by case-insensitive email' do
      manual = create(:user, email: 'jane@example.com') # e.g. created manually, so no Decidim unique_code
      found = matcher.call({ 'unique_code' => 'decidim-user-99', 'email' => 'JANE@Example.com' }, User)
      expect(found).to eq(manual)
    end

    it 'prefers the unique_code match over the email fallback' do
      by_code = create(:user)
      by_code.update_columns(unique_code: 'decidim-user-1')
      create(:user, email: 'shared@example.com')
      found = matcher.call({ 'unique_code' => 'decidim-user-1', 'email' => 'shared@example.com' }, User)
      expect(found).to eq(by_code)
    end

    it 'returns nil when neither unique_code nor email matches' do
      expect(matcher.call({ 'unique_code' => 'nope', 'email' => 'nobody@example.com' }, User)).to be_nil
      expect(matcher.call({}, User)).to be_nil
    end

    # Regression guard: reuse must not issue a query per user row — that N+1 (against a table growing as
    # the import inserts) made a 20k-user production import quadratic. The matcher preloads once, then
    # matches in memory.
    it 'preloads existing users once, then matches with no further queries' do
      create(:user).update_columns(unique_code: 'decidim-user-1')
      matcher.call({ 'unique_code' => 'decidim-user-1' }, User) # first call warms the in-memory maps

      queries = 0
      counter = lambda do |*, payload|
        queries += 1 unless payload[:name] == 'SCHEMA' || payload[:sql].match?(/\A\s*(BEGIN|COMMIT|ROLLBACK|SAVEPOINT|RELEASE)/i)
      end
      ActiveSupport::Notifications.subscribed(counter, 'sql.active_record') do
        20.times { |i| matcher.call({ 'unique_code' => "missing-#{i}" }, User) }
      end
      expect(queries).to eq(0)
    end
  end

  describe "custom idea-status reuse (reuse_matchers['IdeaStatus'])" do
    let(:matcher) { described_class.reuse_matchers['IdeaStatus'] }

    def custom_status(title_multiloc)
      create(:idea_status, code: 'custom', participation_method: 'ideation', title_multiloc: title_multiloc)
    end

    it 'matches an existing custom ideation status that shares any locale title' do
      status = custom_status('fr-FR' => 'Idée faisable', 'en' => 'Feasible')
      # different locale keys, but the English label matches
      expect(matcher.call({ 'title_multiloc' => { 'nl-NL' => 'x', 'en' => 'Feasible' } }, IdeaStatus)).to eq(status)
    end

    it 'does not match a distinct title, so a genuinely new status is created' do
      custom_status('fr-FR' => 'Idée faisable')
      expect(matcher.call({ 'title_multiloc' => { 'fr-FR' => 'Idée non retenue' } }, IdeaStatus)).to be_nil
    end

    it 'ignores standard-code and proposals-method statuses even with a matching title' do
      create(:idea_status, code: 'viewed', participation_method: 'ideation', title_multiloc: { 'en' => 'Same' })
      create(:idea_status, code: 'custom', participation_method: 'proposals', title_multiloc: { 'en' => 'Same' })
      expect(matcher.call({ 'title_multiloc' => { 'en' => 'Same' } }, IdeaStatus)).to be_nil
    end

    it 'returns nil for a blank or missing title' do
      expect(matcher.call({ 'title_multiloc' => { 'en' => '' } }, IdeaStatus)).to be_nil
      expect(matcher.call({}, IdeaStatus)).to be_nil
    end

    it 'reuses the matched status on apply instead of duplicating it' do
      status = custom_status('fr-FR' => 'Idée faisable')
      template = { 'models' => { 'idea_status' => [
        { 'code' => 'custom', 'participation_method' => 'ideation', 'ordering' => 1000, 'color' => '#123456',
          'title_multiloc' => { 'fr-FR' => 'Idée faisable' }, 'description_multiloc' => { 'fr-FR' => 'Réalisable' } }
      ] } }

      expect { described_class.apply_template(template, import_uploads: false) }
        .not_to change(IdeaStatus, :count)
      expect(IdeaStatus.where(code: 'custom').pluck(:id)).to eq([status.id])
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

  describe '.resolve_scope_areas!' do
    it 'rewrites each idea’s parked scope pointer to the imported area’s id and title' do
      area = create(:area, title_multiloc: { 'en' => 'Utah' })
      scoped = create(:idea, custom_field_values: {})
      plain = create(:idea, custom_field_values: {})
      area_attrs = { 'title_multiloc' => { 'en' => 'Utah' } }
      template = {
        'models' => {
          'area' => [area_attrs],
          # The scoped idea's pointer is the *same* area attributes hash (a YAML anchor/alias in practice).
          'idea' => [{ 'custom_field_values' => { 'decidim_scope' => area_attrs } }, { 'custom_field_values' => {} }]
        }
      }
      created = { 'Area' => [area.id], 'Idea' => [scoped.id, plain.id] }

      described_class.resolve_scope_areas!(template, created)

      expect(scoped.reload.custom_field_values['decidim_scope']).to eq(
        'area_id' => area.id, 'title_multiloc' => { 'en' => 'Utah' }
      )
      expect(plain.reload.custom_field_values).to eq({})
    end

    it 'skips the pass when idea/area counts do not line up with the created ids' do
      idea = create(:idea, custom_field_values: { 'decidim_scope' => { 'title_multiloc' => {} } })
      template = { 'models' => { 'area' => [{}], 'idea' => [idea.attributes.slice('custom_field_values')] } }

      described_class.resolve_scope_areas!(template, { 'Area' => [], 'Idea' => [idea.id] })

      expect(idea.reload.custom_field_values['decidim_scope']).to eq('title_multiloc' => {})
    end

    it 'is a no-op when the template has no ideas or areas' do
      expect { described_class.resolve_scope_areas!({ 'models' => {} }, {}) }.not_to raise_error
    end
  end

  describe '.provision_project_pages!' do
    let(:stale) { { 'ROOT' => { 'type' => 'div', 'isCanvas' => true, 'nodes' => [], 'props' => {} } } }

    def project_page(project)
      ContentBuilder::Layout.find_by(content_buildable: project, code: 'project_page')
    end

    it 'regenerates the page for imported projects and leaves non-imported ones untouched' do
      imported = create(:project)
      other = create(:project) # e.g. a pre-existing demo project, not part of the import
      imported_page = ContentBuilder::Layout.create!(
        content_buildable: imported, code: 'project_page', enabled: true, craftjs_json: stale
      )
      other_page = ContentBuilder::Layout.create!(
        content_buildable: other, code: 'project_page', enabled: true, craftjs_json: stale
      )

      described_class.provision_project_pages!('Project' => [imported.id])

      # the imported project's stale page is dropped and rebuilt (a fresh record, real craftjs)
      rebuilt = project_page(imported)
      expect(rebuilt.id).not_to eq(imported_page.id)
      expect(rebuilt.craftjs_json).not_to eq(stale)
      # the non-imported project is left exactly as it was
      expect(project_page(other)).to eq(other_page)
      expect(other_page.reload.craftjs_json).to eq(stale)
    end

    it 'is a no-op when the import created no projects' do
      expect { described_class.provision_project_pages!({}) }.not_to raise_error
    end
  end

  describe '.apply_import_app_config_file' do
    def app_config_json(settings)
      file = Tempfile.new(['decidim', '.app_config.json'])
      file.write({ 'settings' => settings }.to_json)
      file.close
      file
    end

    def flags
      {
        'project_static_pages' => { 'allowed' => true, 'enabled' => true },
        'parallel_participation' => { 'allowed' => true, 'enabled' => true }
      }
    end

    it 'adds the export locales the tenant lacks, keeping its existing ones (additive union)' do
      existing = AppConfiguration.instance.settings('core', 'locales')
      missing = (CL2_SUPPORTED_LOCALES.map(&:to_s) - existing).first
      # order in the patch shouldn't drop the tenant's own
      file = app_config_json({ 'core' => { 'locales' => [missing] + existing } }.merge(flags))

      added = described_class.apply_import_app_config_file(file.path)

      expect(added).to eq([missing])
      locales = AppConfiguration.instance.reload.settings('core', 'locales')
      expect(locales).to include(*existing, missing) # existing kept, missing appended — nothing replaced
    ensure
      file&.unlink
    end

    it 'allows and enables the import feature flags without disturbing the rest of the config' do
      name_before = AppConfiguration.instance.settings('core', 'organization_name')
      file = app_config_json({ 'core' => { 'locales' => AppConfiguration.instance.settings('core', 'locales') } }
        .merge(flags))

      described_class.apply_import_app_config_file(file.path)

      config = AppConfiguration.instance.reload
      expect(config.feature_activated?('project_static_pages')).to be(true)
      expect(config.feature_activated?('parallel_participation')).to be(true)
      expect(config.settings('core', 'organization_name')).to eq(name_before) # untouched
    ensure
      file&.unlink
    end

    it 'returns [] (locales) when the tenant already has every export locale, still enabling the flags' do
      file = app_config_json({ 'core' => { 'locales' => [AppConfiguration.instance.settings('core', 'locales').first] } }
        .merge(flags))

      expect(described_class.apply_import_app_config_file(file.path)).to eq([])
      expect(AppConfiguration.instance.reload.feature_activated?('parallel_participation')).to be(true)
    ensure
      file&.unlink
    end

    it 'is a no-op returning [] when the file is absent' do
      expect(described_class.apply_import_app_config_file('/no/such.app_config.json')).to eq([])
    end
  end
end
