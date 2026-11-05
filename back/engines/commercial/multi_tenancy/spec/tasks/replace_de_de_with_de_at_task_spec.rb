# frozen_string_literal: true

require 'rails_helper'

# rubocop:disable RSpec/DescribeClass
describe 'cl2back:replace_de_DE_with_de_AT rake task' do
  before { load_rake_tasks_if_not_loaded }

  after do
    Rake::Task['cl2back:replace_de_DE_with_de_AT'].reenable
    FileUtils.rm_f(report_path)
  end

  def run_task(host: Tenant.current.host, execute: false)
    Rake::Task['cl2back:replace_de_DE_with_de_AT'].invoke(host, execute ? 'execute' : nil)
  end

  def configure_locales(locales)
    config = AppConfiguration.instance
    settings = config.settings
    settings['core']['locales'] = locales
    config.update!(settings: settings)
  end

  let(:report_path) { Rails.root.join('replace_de_DE_with_de_AT.json') }

  context 'in dry run mode' do
    before { configure_locales(%w[en de-DE]) }

    let!(:project) do
      create(:project, title_multiloc: { 'en' => 'Hello', 'de-DE' => 'Hallo' })
    end

    it 'does not modify any record' do
      expect { run_task }.not_to(change { project.reload.title_multiloc })
    end

    it 'does not add de-AT to tenant locales' do
      run_task
      expect(AppConfiguration.instance.reload.settings('core', 'locales')).not_to include('de-AT')
    end

    it 'does not remove de-DE from tenant locales' do
      run_task
      expect(AppConfiguration.instance.reload.settings('core', 'locales')).to include('de-DE')
    end
  end

  context 'in execute mode, when tenant uses de-DE only' do
    before { configure_locales(%w[en de-DE]) }

    let!(:project) do
      create(:project, title_multiloc: { 'en' => 'Hello', 'de-DE' => 'Hallo' })
    end

    it 'moves the de-DE value to a de-AT key and deletes de-DE' do
      run_task(execute: true)

      multiloc = project.reload.title_multiloc
      expect(multiloc).not_to have_key('de-DE')
      expect(multiloc['de-AT']).to eq('Hallo')
      expect(multiloc['en']).to eq('Hello')
    end

    it 'adds de-AT to tenant locales' do
      run_task(execute: true)
      expect(AppConfiguration.instance.reload.settings('core', 'locales')).to include('de-AT')
    end

    it 'removes de-DE from tenant locales' do
      run_task(execute: true)
      expect(AppConfiguration.instance.reload.settings('core', 'locales')).not_to include('de-DE')
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
      expect(change['new_value']['de-AT']).to eq('Hallo')
      expect(change['new_value']).not_to have_key('de-DE')
    end
  end

  context 'when the tenant already has de-AT in its locales' do
    before { configure_locales(%w[en de-DE de-AT]) }

    let!(:project) do
      create(:project, title_multiloc: { 'en' => 'Hello', 'de-DE' => 'Hallo' })
    end

    it 'still replaces de-DE with de-AT on records' do
      run_task(execute: true)

      multiloc = project.reload.title_multiloc
      expect(multiloc).not_to have_key('de-DE')
      expect(multiloc['de-AT']).to eq('Hallo')
    end

    it 'leaves the locales list with de-AT and without de-DE' do
      run_task(execute: true)
      locales = AppConfiguration.instance.reload.settings('core', 'locales')
      expect(locales).to include('de-AT')
      expect(locales).not_to include('de-DE')
    end
  end

  context 'when a multiloc already has a populated de-AT value' do
    before { configure_locales(%w[en de-DE de-AT]) }

    let!(:project) do
      create(:project, title_multiloc: { 'en' => 'Hello', 'de-DE' => 'Hallo', 'de-AT' => 'Servus' })
    end

    it 'leaves both keys untouched' do
      run_task(execute: true)

      multiloc = project.reload.title_multiloc
      expect(multiloc['de-DE']).to eq('Hallo')
      expect(multiloc['de-AT']).to eq('Servus')
    end
  end

  context 'when a multiloc has an empty de-AT value' do
    before { configure_locales(%w[en de-DE de-AT]) }

    # Seeded via update_columns so the empty de-AT value bypasses multiloc
    # validators that may reject blank locale values.
    let!(:project) do
      project = create(:project, title_multiloc: { 'en' => 'Hello', 'de-DE' => 'Hallo' })
      project.update_columns(title_multiloc: { 'en' => 'Hello', 'de-DE' => 'Hallo', 'de-AT' => '' })
      project
    end

    it 'overwrites the empty de-AT with the de-DE value and deletes de-DE' do
      run_task(execute: true)

      multiloc = project.reload.title_multiloc
      expect(multiloc).not_to have_key('de-DE')
      expect(multiloc['de-AT']).to eq('Hallo')
    end
  end

  context 'when a record has no de-DE key' do
    before { configure_locales(%w[en de-DE]) }

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
    before { configure_locales(%w[en de-DE]) }

    let!(:project) do
      create(:project, title_multiloc: { 'en' => 'Hello', 'de-DE' => 'Hallo' })
    end
    let!(:idea_status) do
      create(
        :idea_status,
        title_multiloc: { 'en' => 'Status', 'de-DE' => 'Status DE' },
        description_multiloc: { 'en' => 'Desc', 'de-DE' => 'Beschreibung' }
      )
    end

    it 'renames de-DE to de-AT in every model with multiloc columns' do
      run_task(execute: true)

      project_multiloc = project.reload.title_multiloc
      expect(project_multiloc).not_to have_key('de-DE')
      expect(project_multiloc['de-AT']).to eq('Hallo')

      status_title = idea_status.reload.title_multiloc
      expect(status_title).not_to have_key('de-DE')
      expect(status_title['de-AT']).to eq('Status DE')

      status_desc = idea_status.description_multiloc
      expect(status_desc).not_to have_key('de-DE')
      expect(status_desc['de-AT']).to eq('Beschreibung')
    end
  end

  context 'nested multilocs inside a JSON column' do
    before { configure_locales(%w[en de-DE]) }

    # The de-DE multiloc sits seven levels below the craftjs_json root,
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
                  { 'block' => { 'content' => { 'de-DE' => '<p>Tief verschachtelter Text</p>' } } }
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

    it 'replaces the de-DE key regardless of nesting depth' do
      run_task(execute: true)

      multiloc = layout.reload.craftjs_json
        .dig('deepNode', 'props', 'config', 'sections', 0, 'block', 'content')
      expect(multiloc).not_to have_key('de-DE')
      expect(multiloc['de-AT']).to eq('<p>Tief verschachtelter Text</p>')
    end

    it 'leaves a nested multiloc untouched when de-AT is already populated' do
      layout.update_columns(
        craftjs_json: layout.craftjs_json.deep_merge(
          'deepNode' => {
            'props' => {
              'config' => {
                'sections' => [
                  { 'block' => { 'content' => { 'de-DE' => 'Deutsch', 'de-AT' => 'Servus' } } }
                ]
              }
            }
          }
        )
      )

      run_task(execute: true)

      multiloc = layout.reload.craftjs_json
        .dig('deepNode', 'props', 'config', 'sections', 0, 'block', 'content')
      expect(multiloc['de-DE']).to eq('Deutsch')
      expect(multiloc['de-AT']).to eq('Servus')
    end
  end

  context 'view-backed models (e.g. Moderation::Moderation)' do
    before { configure_locales(%w[en de-DE]) }

    # `create(:idea)` materialises a row in the `Moderation::Moderation`
    # view via the underlying project. We then patch the project's
    # `title_multiloc` to contain de-DE so the view's
    # `project_title_multiloc` surfaces de-DE — without the view filter,
    # the task would attempt to write to the view and raise ReadOnlyRecord.
    let!(:idea) do
      i = create(:idea)
      i.project.update_columns(title_multiloc: { 'en' => 'Hello', 'de-DE' => 'Hallo' })
      i
    end

    it 'are skipped: no report entry references the view' do
      # Sanity checks on the precondition.
      expect(ApplicationRecord.connection.views).to include(Moderation::Moderation.table_name)
      surfacing_rows = Moderation::Moderation
        .where(project_id: idea.project_id)
        .where("project_title_multiloc ->> 'de-DE' IS NOT NULL")
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
    before { configure_locales(%w[en de-DE]) }

    let!(:activity) do
      create(
        :changed_title_activity,
        payload: { 'change' => [{ 'en' => 'old', 'de-DE' => 'alt' }, { 'en' => 'new', 'de-DE' => 'neu' }] }
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
    before { configure_locales(%w[en de-DE]) }

    let!(:de_de_user) { create(:user, locale: 'de-DE') }
    let!(:en_user) { create(:user, locale: 'en') }

    context 'in dry run mode' do
      it 'does not change any user locale' do
        expect { run_task }.not_to(change { de_de_user.reload.locale })
      end
    end

    context 'in execute mode' do
      it "changes users with locale 'de-DE' to 'de-AT'" do
        run_task(execute: true)
        expect(de_de_user.reload.locale).to eq('de-AT')
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
            c.dig('context', 'record_id') == de_de_user.id &&
            c.dig('context', 'attribute') == 'locale'
        end
        expect(change).to be_present
        expect(change['old_value']).to eq({ 'locale' => 'de-DE' })
        expect(change['new_value']).to eq({ 'locale' => 'de-AT' })
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
    let_it_be(:other_tenant) { create(:tenant, name: 'other-tenant', locales: %w[en de-DE]) }

    around do |example|
      main_tenant = Tenant.current
      example.run
      main_tenant.switch!
    end

    before do
      configure_locales(%w[en de-DE])

      target = Tenant.current
      target_settings = target.read_attribute(:settings).deep_dup
      target_settings['core']['organization_name'] = { 'en' => 'Target', 'de-DE' => 'Ziel' }
      target.update_columns(settings: target_settings)

      other_settings = other_tenant.read_attribute(:settings).deep_dup
      other_settings['core']['organization_name'] = { 'en' => 'Other', 'de-DE' => 'Andere' }
      other_tenant.update_columns(settings: other_settings)
    end

    it "rewrites de-DE to de-AT in the target tenant's row" do
      run_task(execute: true)

      multiloc = Tenant.current.reload.read_attribute(:settings).dig('core', 'organization_name')
      expect(multiloc).not_to have_key('de-DE')
      expect(multiloc['de-AT']).to eq('Ziel')
    end

    it 'leaves other tenants in the public.tenants table untouched' do
      run_task(execute: true)

      multiloc = other_tenant.reload.read_attribute(:settings).dig('core', 'organization_name')
      expect(multiloc).to include('de-DE' => 'Andere')
      expect(multiloc).not_to have_key('de-AT')
    end

    it 'reports a Tenant change only for the target tenant' do
      run_task(execute: true)

      report = JSON.parse(File.read(report_path))
      tenant_changes = report['changes'].select { |c| c.dig('context', 'model') == 'Tenant' }
      expect(tenant_changes.map { |c| c.dig('context', 'record_id') }).to eq([Tenant.current.id])
    end
  end

  context 'when no tenant matches the given host' do
    before { configure_locales(%w[en de-DE]) }

    let!(:project) do
      create(:project, title_multiloc: { 'en' => 'Hello', 'de-DE' => 'Hallo' })
    end

    it 'does not modify any record' do
      expect { run_task(host: 'does-not-exist.govocal.com', execute: true) }
        .not_to(change { project.reload.title_multiloc })
    end

    it 'does not modify tenant locales' do
      run_task(host: 'does-not-exist.govocal.com', execute: true)
      expect(AppConfiguration.instance.reload.settings('core', 'locales')).to eq(%w[en de-DE])
    end
  end

  context 'when the host argument is blank' do
    before { configure_locales(%w[en de-DE]) }

    let!(:project) do
      create(:project, title_multiloc: { 'en' => 'Hello', 'de-DE' => 'Hallo' })
    end

    it 'does not modify any record' do
      expect { run_task(host: '', execute: true) }
        .not_to(change { project.reload.title_multiloc })
    end
  end
end
# rubocop:enable RSpec/DescribeClass
