# frozen_string_literal: true

require 'rails_helper'

# Rename to *_spec.ignore.rb once the task has been released and run, per
# lib/tasks/single_use/README.md.
# rubocop:disable RSpec/DescribeClass
describe 'single_use:migrate_custom_pages_to_content_builder' do
  before { load_rake_tasks_if_not_loaded }

  let(:task) { Rake::Task['single_use:migrate_custom_pages_to_content_builder'] }
  let(:code) { ContentBuilder::CustomPageLayoutService::CODE }
  let(:service) { ContentBuilder::CustomPageLayoutService.new }

  let!(:page) do
    create(
      :static_page,
      code: 'custom',
      top_info_section_multiloc: { 'en' => '<p>Hello</p>' },
      top_info_section_enabled: true
    )
  end

  after do
    task.reenable
    %w[
      migrate_custom_pages_to_content_builder.json
      migrate_custom_pages_to_content_builder_dry_run.json
    ].each { |file| FileUtils.rm_f(file) }
  end

  def layout_for(static_page)
    ContentBuilder::Layout.find_by(content_buildable: static_page, code: code)
  end

  def report(dry_run: false)
    suffix = dry_run ? '_dry_run' : ''
    JSON.parse(File.read("migrate_custom_pages_to_content_builder#{suffix}.json"))
  end

  it 'derives a layout for a page that has none' do
    task.invoke('execute')

    expect(layout_for(page).craftjs_json).to eq service.craftjs_json_for(page)
    expect(layout_for(page).enabled).to be true
  end

  # The layouts PRs 1 and 2 derived predate the header widgets, so the upgrade path for an
  # already-migrated page is a re-derive rather than anything header-specific in the task.
  it 'gives a migrated page its header widgets' do
    task.invoke('execute')

    root = layout_for(page).craftjs_json.fetch('ROOT')
    expect(root['nodes']).to start_with ContentBuilder::CustomPageLayoutService::TITLE_ID
  end

  it 'gives a page with a banner both header widgets, banner first' do
    page.update!(banner_enabled: true)

    task.invoke('execute')

    root = layout_for(page).craftjs_json.fetch('ROOT')
    expect(root['nodes'].first(2)).to eq [
      ContentBuilder::CustomPageLayoutService::BANNER_ID,
      ContentBuilder::CustomPageLayoutService::TITLE_ID
    ]
  end

  it 'writes nothing on a dry run, but reports what it would create' do
    task.invoke

    expect(layout_for(page)).to be_nil
    expect(report(dry_run: true)['creates'].size).to eq 1
  end

  it 'leaves a page that already has a layout alone' do
    existing = ContentBuilder::Layout.create!(
      content_buildable: page, code: code, enabled: true, craftjs_json: { 'ROOT' => {} }
    )

    task.invoke('execute')

    expect(existing.reload.craftjs_json).to eq({ 'ROOT' => {} })
  end

  it 'ignores policy pages and project-scoped pages' do
    policy_page = create(:static_page, code: 'faq')
    project_page = create(:static_page, :project_scoped, code: 'custom')

    task.invoke('execute')

    expect(layout_for(policy_page)).to be_nil
    expect(layout_for(project_page)).to be_nil
  end

  # Once the legacy columns are dropped, this report is the only record of the content that
  # was switched off and so never migrated.
  it 'records the full multiloc of a disabled section it does not migrate' do
    multiloc = { 'en' => '<p>Hidden</p>', 'nl-BE' => '<p>Verborgen</p>' }
    page.update!(bottom_info_section_multiloc: multiloc, bottom_info_section_enabled: false)

    task.invoke('execute')

    archived = report['changes'].find { |change| change.dig('context', 'section') == 'bottom_info_section' }
    expect(archived['old_value']).to eq multiloc
    expect(archived['new_value']).to be_nil
    expect(archived['context']).to include('page_id' => page.id, 'slug' => page.slug)
  end

  context 'with overwrite' do
    subject(:run) { task.invoke('execute', nil, 'overwrite') }

    it 're-derives a layout whose page has moved on' do
      existing = ContentBuilder::Layout.create!(
        content_buildable: page, code: code, enabled: true, craftjs_json: { 'ROOT' => {} }
      )

      run

      expect(existing.reload.craftjs_json).to eq service.craftjs_json_for(page)
    end

    # Without this the task would rewrite every row on every run and never settle.
    it 'leaves an up-to-date layout untouched' do
      ContentBuilder::Layout.create!(
        content_buildable: page, code: code, enabled: true, craftjs_json: service.craftjs_json_for(page)
      )

      run

      expect(report['changes']).to be_empty
    end

    it 'refuses a tenant whose builder flag is already active' do
      SettingsService.new.activate_feature!('custom_page_builder')

      run

      expect(layout_for(page)).to be_nil
      expect(report['errors'].first['error']).to match(/refused/)
    end

    it 'goes ahead on an active tenant when also forced' do
      SettingsService.new.activate_feature!('custom_page_builder')

      task.invoke('execute', nil, 'overwrite', 'force')

      expect(layout_for(page)).to be_present
    end
  end
end
# rubocop:enable RSpec/DescribeClass
