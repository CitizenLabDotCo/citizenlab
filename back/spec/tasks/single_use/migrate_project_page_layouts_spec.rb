# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'single_use:migrate_project_page_layouts' do # rubocop:disable RSpec/DescribeClass
  before(:all) { load_rake_tasks_if_not_loaded } # rubocop:disable RSpec/BeforeAfterAll

  before { Rake::Task['single_use:migrate_project_page_layouts'].reenable }

  # --- fixtures -------------------------------------------------------------

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

  def node(resolved_name, parent:, nodes: [], props: {}, is_canvas: false, linked_nodes: {})
    {
      'type' => { 'resolvedName' => resolved_name },
      'nodes' => nodes,
      'props' => props,
      'custom' => {},
      'hidden' => false,
      'parent' => parent,
      'isCanvas' => is_canvas,
      'displayName' => resolved_name,
      'linkedNodes' => linked_nodes
    }
  end

  let(:plain_text_description) do
    {
      'ROOT' => description_root(['txt1']),
      'txt1' => node('TextMultiloc', parent: 'ROOT', props: { 'text' => { 'en' => '<p>Hello</p>' } })
    }
  end

  let(:rich_description) do
    {
      'ROOT' => description_root(%w[img1 col1 acc1]),
      'img1' => node('ImageMultiloc', parent: 'ROOT', props: { 'image' => { 'dataCode' => 'abc' } }),
      'col1' => node('TwoColumn', parent: 'ROOT', nodes: %w[left1 right1], props: { 'columnLayout' => '1-1' }),
      'left1' => node('Container', parent: 'col1', nodes: ['nested1'], props: { 'id' => 'left' }, is_canvas: true),
      'right1' => node('Container', parent: 'col1', props: { 'id' => 'right' }, is_canvas: true),
      'nested1' => node('TextMultiloc', parent: 'left1', props: { 'text' => { 'en' => 'nested' } }),
      'acc1' => node('AccordionMultiloc', parent: 'ROOT', props: { 'text' => { 'en' => 'accordion' } })
    }
  end

  let(:file_attachment_description) do
    {
      'ROOT' => description_root(['file1']),
      'file1' => node('FileAttachment', parent: 'ROOT', props: { 'fileId' => 'file-123' })
    }
  end

  let(:empty_description) { { 'ROOT' => description_root([]) } }

  let(:unsupported_description) do
    {
      'ROOT' => description_root(%w[pub1 col1 txt1]),
      'pub1' => node('Published', parent: 'ROOT'),
      # An unsupported widget nested inside a surviving column must be stripped too.
      'col1' => node('TwoColumn', parent: 'ROOT', nodes: %w[left1], props: { 'columnLayout' => '1-1' }),
      'left1' => node('Container', parent: 'col1', nodes: %w[sel1 keep1], props: { 'id' => 'left' }, is_canvas: true),
      'sel1' => node('Selection', parent: 'left1'),
      'keep1' => node('TextMultiloc', parent: 'left1', props: { 'text' => { 'en' => 'kept' } }),
      'txt1' => node('TextMultiloc', parent: 'ROOT', props: { 'text' => { 'en' => 'top' } })
    }
  end

  let(:aboutbox_description) do
    {
      'ROOT' => description_root(['about1']),
      'about1' => node('AboutBox', parent: 'ROOT')
    }
  end

  def build(json)
    ProjectPageLayoutBuilder.new(json).build
  end

  def resolved_names(json)
    json.values.filter_map do |n|
      type = n['type']
      type.is_a?(Hash) ? type['resolvedName'] : nil
    end
  end

  CANONICAL_NAMES = %w[
    ProjectPageRoot ProjectBanner ProjectTitle ProjectPageBody
    TimelineWidget InputFeed EventsWidget
  ].freeze

  # --- transform unit tests -------------------------------------------------

  describe 'ProjectPageLayoutBuilder' do
    it 'produces the canonical locked header + body structure' do
      result = build(plain_text_description)

      expect(result['ROOT']['nodes']).to eq(%w[PROJECT_PAGE_BANNER PROJECT_PAGE_TITLE PROJECT_PAGE_BODY])
      expect(result['ROOT']['type']).to eq({ 'resolvedName' => 'ProjectPageRoot' })
      CANONICAL_NAMES.each { |name| expect(resolved_names(result)).to include(name) }
    end

    it 'does not seed a TwoColumn or AboutBox' do
      result = build(plain_text_description)

      expect(result.keys).not_to include('PROJECT_PAGE_TWO_COLUMN', 'PROJECT_PAGE_ABOUT_BOX')
      # The only AboutBox/TwoColumn present is whatever the description itself had.
      expect(resolved_names(result)).not_to include('AboutBox')
    end

    it 'places the description content between the timeline and the input feed' do
      result = build(plain_text_description)

      expect(result['PROJECT_PAGE_BODY']['nodes']).to eq(
        %w[PROJECT_PAGE_TIMELINE d_txt1 PROJECT_PAGE_INPUT_FEED PROJECT_PAGE_EVENTS]
      )
    end

    it 're-keys injected nodes and re-parents top-level content to the body' do
      result = build(plain_text_description)

      expect(result).to have_key('d_txt1')
      expect(result).not_to have_key('txt1')
      expect(result['d_txt1']['parent']).to eq('PROJECT_PAGE_BODY')
    end

    it 'preserves nested content and remaps inner parent/child pointers' do
      result = build(rich_description)

      expect(result['PROJECT_PAGE_BODY']['nodes']).to eq(
        %w[PROJECT_PAGE_TIMELINE d_img1 d_col1 d_acc1 PROJECT_PAGE_INPUT_FEED PROJECT_PAGE_EVENTS]
      )
      expect(result['d_col1']['nodes']).to eq(%w[d_left1 d_right1])
      expect(result['d_col1']['parent']).to eq('PROJECT_PAGE_BODY')
      expect(result['d_left1']['nodes']).to eq(['d_nested1'])
      expect(result['d_nested1']['parent']).to eq('d_left1')
    end

    it 'carries over file attachment nodes (with their fileId) so they re-sync' do
      result = build(file_attachment_description)

      expect(result['d_file1']['type']).to eq({ 'resolvedName' => 'FileAttachment' })
      expect(result['d_file1']['props']).to eq({ 'fileId' => 'file-123' })
    end

    it 'strips unsupported widgets and their subtrees, keeping the rest' do
      result = build(unsupported_description)

      names = resolved_names(result)
      expect(names).not_to include('Published', 'Selection')
      # Surviving content is kept and re-parented.
      expect(result['PROJECT_PAGE_BODY']['nodes']).to eq(
        %w[PROJECT_PAGE_TIMELINE d_col1 d_txt1 PROJECT_PAGE_INPUT_FEED PROJECT_PAGE_EVENTS]
      )
      expect(result['d_left1']['nodes']).to eq(['d_keep1'])
      expect(result).not_to have_key('d_sel1')
      expect(result).not_to have_key('d_pub1')
    end

    it 'keeps an AboutBox that the description author added' do
      result = build(aboutbox_description)

      expect(resolved_names(result)).to include('AboutBox')
      expect(result['d_about1']['parent']).to eq('PROJECT_PAGE_BODY')
    end

    it 'produces the full canonical structure for an empty description' do
      result = build(empty_description)

      expect(result['PROJECT_PAGE_BODY']['nodes']).to eq(
        %w[PROJECT_PAGE_TIMELINE PROJECT_PAGE_INPUT_FEED PROJECT_PAGE_EVENTS]
      )
      CANONICAL_NAMES.each { |name| expect(resolved_names(result)).to include(name) }
    end

    it 'is idempotent — building twice yields identical json' do
      expect(build(rich_description)).to eq(build(rich_description))
    end

    it 'reproduces the current locked-header custom titles (fixed point of ensureLockedHeaderNodes)' do
      result = build(empty_description)

      expect(result['PROJECT_PAGE_INPUT_FEED']['custom']).to eq(
        'title' => {
          'id' => 'app.components.ProjectPageBuilder.Widgets.inputFeedWidgetTitle2',
          'defaultMessage' => 'Phase content'
        },
        'locked' => true,
        'noPointerEvents' => true
      )
      expect(result['PROJECT_PAGE_BANNER']['custom']['locked']).to be(true)
      expect(result['PROJECT_PAGE_TITLE']['custom']['locked']).to be(true)
    end
  end

  # --- rake task integration tests ------------------------------------------

  describe 'the rake task' do
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
        %w[PROJECT_PAGE_TIMELINE d_txt1 PROJECT_PAGE_INPUT_FEED PROJECT_PAGE_EVENTS]
      )
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
end
