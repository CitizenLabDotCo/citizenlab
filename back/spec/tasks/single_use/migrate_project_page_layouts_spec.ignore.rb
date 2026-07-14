# frozen_string_literal: true

require 'rails_helper'

# The craftjs transform itself is covered by the ContentBuilder::ProjectPageLayoutService spec.
RSpec.describe 'single_use:migrate_project_page_layouts' do
  before(:all) { load_rake_tasks_if_not_loaded } # rubocop:disable RSpec/BeforeAfterAll

  before { Rake::Task['single_use:migrate_project_page_layouts'].reenable }

  def description_root(child_ids)
    {
      'type' => 'div',
      'nodes' => child_ids,
      'props' => { 'id' => 'e2e-content-builder-frame' },
      'custom' => {},
      'hidden' => false,
      'isCanvas' => true,
      'displayName' => 'div',
      'linkedNodes' => {}
    }
  end

  def node(resolved_name, parent:, props: {})
    {
      'type' => { 'resolvedName' => resolved_name },
      'nodes' => [],
      'props' => props,
      'custom' => {},
      'hidden' => false,
      'parent' => parent,
      'isCanvas' => false,
      'displayName' => resolved_name,
      'linkedNodes' => {}
    }
  end

  let(:plain_text_description) do
    {
      'ROOT' => description_root(['txt1']),
      'txt1' => node('TextMultiloc', parent: 'ROOT', props: { 'text' => { 'en' => '<p>Hello</p>' } })
    }
  end

  let(:project) { create(:project) }

  def run_task(dry_run: false)
    original = ENV.fetch('DRY_RUN', nil)
    ENV['DRY_RUN'] = dry_run ? 'true' : 'false'
    allow(File).to receive(:write) # avoid littering the report file
    Rake::Task['single_use:migrate_project_page_layouts'].invoke
  ensure
    ENV['DRY_RUN'] = original
    Rake::Task['single_use:migrate_project_page_layouts'].reenable
  end

  it 'creates an enabled project_page layout for a project with a description' do
    create(:layout, content_buildable: project, code: 'project_description', craftjs_json: plain_text_description)

    expect { run_task }.to change { ContentBuilder::Layout.where(code: 'project_page').count }.by(1)

    layout = ContentBuilder::Layout.find_by(code: 'project_page', content_buildable: project)
    expect(layout.enabled).to be(true)
    expect(layout.craftjs_json['PROJECT_PAGE_BODY']['nodes']).to eq(
      %w[PROJECT_PAGE_DESCRIPTION PROJECT_PAGE_PHASES PROJECT_PAGE_EVENTS]
    )
    expect(layout.craftjs_json['PROJECT_PAGE_DESCRIPTION']['nodes']).to eq(['d_txt1'])
  end

  it 'makes no changes in dry-run mode (the default)' do
    create(:layout, content_buildable: project, code: 'project_description', craftjs_json: plain_text_description)

    expect { run_task(dry_run: true) }.not_to change { ContentBuilder::Layout.where(code: 'project_page').count }
  end

  it 'leaves the project_description layout untouched' do
    description = create(:layout, content_buildable: project, code: 'project_description', craftjs_json: plain_text_description)

    run_task

    expect(description.reload.craftjs_json).to eq(plain_text_description)
  end

  it 'is idempotent and never overwrites an existing project_page' do
    create(:layout, content_buildable: project, code: 'project_description', craftjs_json: plain_text_description)
    existing = create(:layout, content_buildable: project, code: 'project_page', craftjs_json: { 'ROOT' => description_root([]) })

    expect { run_task }.not_to change { ContentBuilder::Layout.where(code: 'project_page').count }
    expect(existing.reload.craftjs_json).to eq({ 'ROOT' => description_root([]) })
  end

  it 'syncs carried-over file attachments onto the new layout' do
    file = create(:file)
    description_json = {
      'ROOT' => description_root(['file1']),
      'file1' => node('FileAttachment', parent: 'ROOT', props: { 'fileId' => file.id })
    }
    create(:layout, content_buildable: project, code: 'project_description', craftjs_json: description_json)

    run_task

    layout = ContentBuilder::Layout.find_by(code: 'project_page', content_buildable: project)
    expect(layout.file_attachments.where(file: file).count).to eq(1)
  end
end
