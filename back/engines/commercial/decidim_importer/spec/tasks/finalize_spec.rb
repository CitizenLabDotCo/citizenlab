# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'decidim_importer:finalize' do # rubocop:disable RSpec/DescribeClass
  before(:all) { load_rake_tasks_if_not_loaded } # rubocop:disable RSpec/BeforeAfterAll

  before { Rake::Task['decidim_importer:finalize'].reenable }

  let(:tmpdir) { Dir.mktmpdir }
  let(:mapping_path) { File.join(tmpdir, 'export.url_mapping.csv') }

  after { FileUtils.remove_entry(tmpdir) }

  def run_task
    Rake::Task['decidim_importer:finalize'].invoke(mapping_path, Tenant.current.host)
  end

  def text_node(html)
    { 'type' => { 'resolvedName' => 'TextMultiloc' }, 'nodes' => [],
      'props' => { 'text' => { 'en' => html } }, 'custom' => {}, 'hidden' => false,
      'parent' => 'ROOT', 'isCanvas' => false, 'displayName' => 'Text', 'linkedNodes' => {} }
  end

  def layout_with(html)
    craftjs = {
      'ROOT' => { 'type' => 'div', 'nodes' => %w[text-1], 'props' => { 'id' => 'e2e-content-builder-frame' },
                  'custom' => {}, 'hidden' => false, 'isCanvas' => true, 'displayName' => 'div',
                  'linkedNodes' => {} },
      'text-1' => text_node(html)
    }
    create(:layout, craftjs_json: craftjs)
  end

  def layout_text(layout)
    layout.reload.craftjs_json['text-1']['props']['text']['en']
  end

  describe 'link correction' do
    it 'rewrites a mapped content link in a layout and reports a broken one' do
      layout = layout_with('<p><a href="/processes/a">A</a> and <a href="/processes/gone">G</a></p>')
      DecidimImporter::LinkMap.new({ '/processes/a' => '/projects/a' }, {}, ['/processes/gone'])
        .write_csv(mapping_path)

      run_task

      expect(layout_text(layout)).to include('/projects/a')      # mapped link rewritten
      expect(layout_text(layout)).to include('/processes/gone')  # broken link left untouched

      broken_csv = File.read(File.join(tmpdir, 'export.broken_links.csv'))
      expect(broken_csv).to include('/processes/gone')
      expect(broken_csv).to include(layout.content_buildable_id) # reported against its project
    end

    it 'resolves a file link to the imported file’s real content URL' do
      file = create(:global_file)
      layout = layout_with('<a href="/blob/report.pdf">R</a>')
      DecidimImporter::LinkMap.new({}, { '/blob/report.pdf' => file.id }, []).write_csv(mapping_path)

      run_task

      expect(layout_text(layout)).to include(file.content.url)
      expect(layout_text(layout)).not_to include('/blob/report.pdf')
    end

    it 'rewrites mapped links in static pages too' do
      page = create(:static_page, top_info_section_enabled: true,
        top_info_section_multiloc: { 'en' => '<a href="/processes/a">A</a>' })
      DecidimImporter::LinkMap.new({ '/processes/a' => '/projects/a' }, {}, []).write_csv(mapping_path)

      run_task

      expect(page.reload.top_info_section_multiloc['en']).to include('/projects/a')
    end

    it 'writes no broken-links CSV when every should-be-corrected link resolves' do
      layout_with('<a href="/processes/a">A</a>')
      DecidimImporter::LinkMap.new({ '/processes/a' => '/projects/a' }, {}, []).write_csv(mapping_path)

      run_task

      expect(File).not_to exist(File.join(tmpdir, 'export.broken_links.csv'))
    end
  end

  describe 'Consultations folder' do
    it 'gathers ungrouped projects into a Consultations folder with a nav bar item' do
      project = create(:project)
      DecidimImporter::LinkMap.new({}, {}, []).write_csv(mapping_path)

      run_task

      folder = ProjectFolders::Folder.find_by(slug: 'consultations')
      expect(folder).to be_present
      expect(project.reload.admin_publication.parent).to eq(folder.admin_publication)
      expect(folder.reload.nav_bar_item).to be_present
    end
  end
end
