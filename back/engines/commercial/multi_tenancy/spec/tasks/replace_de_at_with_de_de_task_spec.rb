# frozen_string_literal: true

require 'rails_helper'

# rubocop:disable RSpec/DescribeClass
describe 'cl2back:replace_de_AT_with_de_DE rake task' do
  before { load_rake_tasks_if_not_loaded }

  after do
    Rake::Task['cl2back:replace_de_AT_with_de_DE'].reenable
    FileUtils.rm_f(report_path)
  end

  def run_task(host: Tenant.current.host, execute: false)
    Rake::Task['cl2back:replace_de_AT_with_de_DE'].invoke(host, execute ? 'execute' : nil)
  end

  def configure_locales(locales)
    config = AppConfiguration.instance
    settings = config.settings
    settings['core']['locales'] = locales
    config.update!(settings: settings)
  end

  let(:report_path) { Rails.root.join('replace_de_AT_with_de_DE.json') }

  context 'in dry run mode' do
    before { configure_locales(%w[en de-AT]) }

    let!(:project) do
      create(:project, title_multiloc: { 'en' => 'Hello', 'de-AT' => 'Servus' })
    end

    it 'does not modify any record' do
      expect { run_task }.not_to(change { project.reload.title_multiloc })
    end

    it 'does not add de-DE to tenant locales' do
      run_task
      expect(AppConfiguration.instance.reload.settings('core', 'locales')).not_to include('de-DE')
    end

    it 'does not remove de-AT from tenant locales' do
      run_task
      expect(AppConfiguration.instance.reload.settings('core', 'locales')).to include('de-AT')
    end
  end

  context 'in execute mode, when tenant uses de-AT only' do
    before { configure_locales(%w[en de-AT]) }

    let!(:project) do
      create(:project, title_multiloc: { 'en' => 'Hello', 'de-AT' => 'Servus' })
    end

    it 'moves the de-AT value to a de-DE key and deletes de-AT' do
      run_task(execute: true)

      multiloc = project.reload.title_multiloc
      expect(multiloc).not_to have_key('de-AT')
      expect(multiloc['de-DE']).to eq('Servus')
      expect(multiloc['en']).to eq('Hello')
    end

    it 'adds de-DE to tenant locales' do
      run_task(execute: true)
      expect(AppConfiguration.instance.reload.settings('core', 'locales')).to include('de-DE')
    end

    it 'removes de-AT from tenant locales' do
      run_task(execute: true)
      expect(AppConfiguration.instance.reload.settings('core', 'locales')).not_to include('de-AT')
    end

    it 'writes a JSON report with the before and after multiloc values' do
      original_multiloc = project.title_multiloc

      run_task(execute: true)

      report = JSON.parse(File.read(report_path))
      change = report['changes'].find do |c|
        c.dig('context', 'model') == 'Project' &&
          c.dig('context', 'record_id') == project.id &&
          c.dig('context', 'attribute') == 'title_multiloc'
      end
      expect(change).to be_present
      expect(change['old_value']).to eq(original_multiloc)
      expect(change['new_value']['de-DE']).to eq('Servus')
      expect(change['new_value']).not_to have_key('de-AT')
    end
  end

  context 'when the tenant already has de-DE in its locales' do
    before { configure_locales(%w[en de-AT de-DE]) }

    let!(:project) do
      create(:project, title_multiloc: { 'en' => 'Hello', 'de-AT' => 'Servus' })
    end

    it 'still replaces de-AT with de-DE on records' do
      run_task(execute: true)

      multiloc = project.reload.title_multiloc
      expect(multiloc).not_to have_key('de-AT')
      expect(multiloc['de-DE']).to eq('Servus')
    end

    it 'leaves the locales list with de-DE and without de-AT' do
      run_task(execute: true)
      locales = AppConfiguration.instance.reload.settings('core', 'locales')
      expect(locales).to include('de-DE')
      expect(locales).not_to include('de-AT')
    end
  end

  context 'when a multiloc already has a populated de-DE value' do
    before { configure_locales(%w[en de-AT de-DE]) }

    let!(:project) do
      create(:project, title_multiloc: { 'en' => 'Hello', 'de-AT' => 'Servus', 'de-DE' => 'Hallo' })
    end

    it 'leaves both keys untouched' do
      run_task(execute: true)

      multiloc = project.reload.title_multiloc
      expect(multiloc['de-AT']).to eq('Servus')
      expect(multiloc['de-DE']).to eq('Hallo')
    end
  end

  context 'when a multiloc has an empty de-DE value' do
    before { configure_locales(%w[en de-AT de-DE]) }

    # Seeded via update_columns so the empty de-DE value bypasses multiloc
    # validators that may reject blank locale values.
    let!(:project) do
      project = create(:project, title_multiloc: { 'en' => 'Hello', 'de-AT' => 'Servus' })
      project.update_columns(title_multiloc: { 'en' => 'Hello', 'de-AT' => 'Servus', 'de-DE' => '' })
      project
    end

    it 'overwrites the empty de-DE with the de-AT value and deletes de-AT' do
      run_task(execute: true)

      multiloc = project.reload.title_multiloc
      expect(multiloc).not_to have_key('de-AT')
      expect(multiloc['de-DE']).to eq('Servus')
    end
  end

  context 'when a record has no de-AT key' do
    before { configure_locales(%w[en de-AT]) }

    let!(:project) do
      create(:project, title_multiloc: { 'en' => 'Hello' })
    end

    it 'leaves the multiloc untouched' do
      original_multiloc = project.title_multiloc
      run_task(execute: true)
      expect(project.reload.title_multiloc).to eq(original_multiloc)
    end
  end

  context 'across multiple models' do
    before { configure_locales(%w[en de-AT]) }

    let!(:project) do
      create(:project, title_multiloc: { 'en' => 'Hello', 'de-AT' => 'Servus' })
    end
    let!(:idea_status) do
      create(
        :idea_status,
        title_multiloc: { 'en' => 'Status', 'de-AT' => 'Status AT' },
        description_multiloc: { 'en' => 'Desc', 'de-AT' => 'Beschreibung' }
      )
    end

    it 'renames de-AT to de-DE in every model with multiloc columns' do
      run_task(execute: true)

      project_multiloc = project.reload.title_multiloc
      expect(project_multiloc).not_to have_key('de-AT')
      expect(project_multiloc['de-DE']).to eq('Servus')

      status_title = idea_status.reload.title_multiloc
      expect(status_title).not_to have_key('de-AT')
      expect(status_title['de-DE']).to eq('Status AT')

      status_desc = idea_status.description_multiloc
      expect(status_desc).not_to have_key('de-AT')
      expect(status_desc['de-DE']).to eq('Beschreibung')
    end
  end

  context 'nested multilocs inside a JSON column' do
    before { configure_locales(%w[en de-AT]) }

    # The de-AT multiloc sits seven levels below the craftjs_json root,
    # reached through both nested hashes and an array.
    let!(:layout) do
      create(
        :layout,
        craftjs_json: {
          'ROOT' => {
            'type' => 'div',
            'nodes' => ['deepNode'],
            'props' => {},
            'custom' => {},
            'hidden' => false,
            'isCanvas' => true,
            'displayName' => 'div',
            'linkedNodes' => {}
          },
          'deepNode' => {
            'type' => { 'resolvedName' => 'Container' },
            'nodes' => [],
            'props' => {
              'config' => {
                'sections' => [
                  { 'block' => { 'content' => { 'de-AT' => '<p>Tief verschachtelter Text</p>' } } }
                ]
              }
            },
            'custom' => {},
            'hidden' => false,
            'parent' => 'ROOT',
            'isCanvas' => false,
            'displayName' => 'Container',
            'linkedNodes' => {}
          }
        }
      )
    end

    it 'replaces the de-AT key regardless of nesting depth' do
      run_task(execute: true)

      multiloc = layout.reload.craftjs_json
        .dig('deepNode', 'props', 'config', 'sections', 0, 'block', 'content')
      expect(multiloc).not_to have_key('de-AT')
      expect(multiloc['de-DE']).to eq('<p>Tief verschachtelter Text</p>')
    end

    it 'leaves a nested multiloc untouched when de-DE is already populated' do
      layout.update_columns(
        craftjs_json: layout.craftjs_json.deep_merge(
          'deepNode' => {
            'props' => {
              'config' => {
                'sections' => [
                  { 'block' => { 'content' => { 'de-AT' => 'Servus', 'de-DE' => 'Deutsch' } } }
                ]
              }
            }
          }
        )
      )

      run_task(execute: true)

      multiloc = layout.reload.craftjs_json
        .dig('deepNode', 'props', 'config', 'sections', 0, 'block', 'content')
      expect(multiloc['de-AT']).to eq('Servus')
      expect(multiloc['de-DE']).to eq('Deutsch')
    end
  end

  context 'view-backed models (e.g. Moderation::Moderation)' do
    before { configure_locales(%w[en de-AT]) }

    # `create(:idea)` materialises a row in the `Moderation::Moderation`
    # view via the underlying project. We then patch the project's
    # `title_multiloc` to contain de-AT so the view's
    # `project_title_multiloc` surfaces de-AT — without the view filter,
    # the task would attempt to write to the view and raise ReadOnlyRecord.
    let!(:idea) do
      i = create(:idea)
      i.project.update_columns(title_multiloc: { 'en' => 'Hello', 'de-AT' => 'Servus' })
      i
    end

    it 'are skipped: no report entry references the view' do
      # Sanity checks on the precondition.
      expect(ApplicationRecord.connection.views).to include(Moderation::Moderation.table_name)
      surfacing_rows = Moderation::Moderation
        .where(project_id: idea.project_id)
        .where("project_title_multiloc ->> 'de-AT' IS NOT NULL")
      expect(surfacing_rows).to be_any

      run_task(execute: true)

      report = JSON.parse(File.read(report_path))
      moderation_changes = report['changes'].select { |c| c.dig('context', 'model') == 'Moderation::Moderation' }
      moderation_errors = report['errors'].select { |e| e.dig('context', 'model') == 'Moderation::Moderation' }
      expect(moderation_changes).to be_empty
      expect(moderation_errors).to be_empty
    end
  end

  context 'audit-log models (Activity)' do
    # Activity records are an immutable event log: payloads capture what the
    # data looked like at the moment of the action. The task must NOT rewrite
    # them — that would falsify history.
    before { configure_locales(%w[en de-AT]) }

    let!(:activity) do
      create(
        :changed_title_activity,
        payload: { 'change' => [{ 'en' => 'old', 'de-AT' => 'alt' }, { 'en' => 'new', 'de-AT' => 'neu' }] }
      )
    end

    it 'leaves the payload untouched' do
      original_payload = activity.payload
      run_task(execute: true)
      expect(activity.reload.payload).to eq(original_payload)
    end

    it 'records no change for the Activity model in the report' do
      run_task(execute: true)
      report = JSON.parse(File.read(report_path))
      activity_changes = report['changes'].select { |c| c.dig('context', 'model') == 'Activity' }
      expect(activity_changes).to be_empty
    end
  end

  context 'User.locale migration' do
    before { configure_locales(%w[en de-AT]) }

    let!(:de_at_user) { create(:user, locale: 'de-AT') }
    let!(:en_user) { create(:user, locale: 'en') }

    context 'in dry run mode' do
      it 'does not change any user locale' do
        expect { run_task }.not_to(change { de_at_user.reload.locale })
      end
    end

    context 'in execute mode' do
      it "changes users with locale 'de-AT' to 'de-DE'" do
        run_task(execute: true)
        expect(de_at_user.reload.locale).to eq('de-DE')
      end

      it 'leaves users with other locales unchanged' do
        run_task(execute: true)
        expect(en_user.reload.locale).to eq('en')
      end

      it 'records the User.locale change in the report' do
        run_task(execute: true)

        report = JSON.parse(File.read(report_path))
        change = report['changes'].find do |c|
          c.dig('context', 'model') == 'User' &&
            c.dig('context', 'record_id') == de_at_user.id &&
            c.dig('context', 'attribute') == 'locale'
        end
        expect(change).to be_present
        expect(change['old_value']).to eq({ 'locale' => 'de-AT' })
        expect(change['new_value']).to eq({ 'locale' => 'de-DE' })
      end
    end
  end

  context 'with another tenant present in the public.tenants table' do
    # `Tenant` is in Apartment's `excluded_models`, so `Tenant.where(...)`
    # ignores `tenant.switch` and scans every tenant row. The task must
    # constrain itself to the row matching the host argument.
    # Note: `Tenant#settings` is a deprecated reader that delegates to
    # `AppConfiguration.instance.settings`; we go through `read_attribute`
    # to get the raw public.tenants jsonb column, which is what the task
    # actually walks.
    let_it_be(:other_tenant) { create(:tenant, name: 'other-tenant', locales: %w[en de-AT]) }

    around do |example|
      main_tenant = Tenant.current
      example.run
      main_tenant.switch!
    end

    before do
      configure_locales(%w[en de-AT])

      target = Tenant.current
      target_settings = target.read_attribute(:settings).deep_dup
      target_settings['core']['organization_name'] = { 'en' => 'Target', 'de-AT' => 'Ziel' }
      target.update_columns(settings: target_settings)

      other_settings = other_tenant.read_attribute(:settings).deep_dup
      other_settings['core']['organization_name'] = { 'en' => 'Other', 'de-AT' => 'Andere' }
      other_tenant.update_columns(settings: other_settings)
    end

    it "rewrites de-AT to de-DE in the target tenant's row" do
      run_task(execute: true)

      multiloc = Tenant.current.reload.read_attribute(:settings).dig('core', 'organization_name')
      expect(multiloc).not_to have_key('de-AT')
      expect(multiloc['de-DE']).to eq('Ziel')
    end

    it 'leaves other tenants in the public.tenants table untouched' do
      run_task(execute: true)

      multiloc = other_tenant.reload.read_attribute(:settings).dig('core', 'organization_name')
      expect(multiloc).to include('de-AT' => 'Andere')
      expect(multiloc).not_to have_key('de-DE')
    end

    it 'reports a Tenant change only for the target tenant' do
      run_task(execute: true)

      report = JSON.parse(File.read(report_path))
      tenant_changes = report['changes'].select { |c| c.dig('context', 'model') == 'Tenant' }
      expect(tenant_changes.map { |c| c.dig('context', 'record_id') }).to eq([Tenant.current.id])
    end
  end

  context 'when no tenant matches the given host' do
    before { configure_locales(%w[en de-AT]) }

    let!(:project) do
      create(:project, title_multiloc: { 'en' => 'Hello', 'de-AT' => 'Servus' })
    end

    it 'does not modify any record' do
      expect { run_task(host: 'does-not-exist.govocal.com', execute: true) }
        .not_to(change { project.reload.title_multiloc })
    end

    it 'does not modify tenant locales' do
      run_task(host: 'does-not-exist.govocal.com', execute: true)
      expect(AppConfiguration.instance.reload.settings('core', 'locales')).to eq(%w[en de-AT])
    end
  end

  context 'when the host argument is blank' do
    before { configure_locales(%w[en de-AT]) }

    let!(:project) do
      create(:project, title_multiloc: { 'en' => 'Hello', 'de-AT' => 'Servus' })
    end

    it 'does not modify any record' do
      expect { run_task(host: '', execute: true) }
        .not_to(change { project.reload.title_multiloc })
    end
  end
end
# rubocop:enable RSpec/DescribeClass
