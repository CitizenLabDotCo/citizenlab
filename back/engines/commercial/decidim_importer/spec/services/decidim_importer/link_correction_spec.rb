# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DecidimImporter::LinkCorrection do
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

  it 'rewrites a mapped content link in a layout and returns the broken one' do
    layout = layout_with('<p><a href="/processes/a">A</a> and <a href="/processes/gone">G</a></p>')
    map = DecidimImporter::LinkMap.new({ '/processes/a' => '/projects/a' }, {}, ['/processes/gone'])

    broken = described_class.new(map).run

    expect(layout_text(layout)).to include('/projects/a')      # mapped link rewritten
    expect(layout_text(layout)).to include('/processes/gone')  # broken link left untouched
    expect(broken).to contain_exactly(
      { old_url: '/processes/gone', container_type: layout.content_buildable_type,
        container_id: layout.content_buildable_id }
    )
  end

  it 'resolves a file link to the imported file’s real content URL' do
    file = create(:global_file)
    layout = layout_with('<a href="/blob/report.pdf">R</a>')
    map = DecidimImporter::LinkMap.new({}, { '/blob/report.pdf' => file.id }, [])

    described_class.new(map).run

    expect(layout_text(layout)).to include(file.content.url)
    expect(layout_text(layout)).not_to include('/blob/report.pdf')
  end

  it 'rewrites mapped links in static pages too' do
    page = create(:static_page, top_info_section_enabled: true,
      top_info_section_multiloc: { 'en' => '<a href="/processes/a">A</a>' })
    map = DecidimImporter::LinkMap.new({ '/processes/a' => '/projects/a' }, {}, [])

    described_class.new(map).run

    expect(page.reload.top_info_section_multiloc['en']).to include('/projects/a')
  end

  it 'counts the records it rewrote and leaves untouched ones out of the count' do
    layout_with('<a href="/processes/a">A</a>')  # rewritten
    layout_with('<p>no links here</p>')          # untouched
    map = DecidimImporter::LinkMap.new({ '/processes/a' => '/projects/a' }, {}, [])

    correction = described_class.new(map)
    correction.run

    expect(correction.updated_count).to eq(1)
  end

  it 'reports no broken links when every should-be-corrected link resolves' do
    layout_with('<a href="/processes/a">A</a>')
    map = DecidimImporter::LinkMap.new({ '/processes/a' => '/projects/a' }, {}, [])

    expect(described_class.new(map).run).to be_empty
  end

  it 'reads its mapping from the dumped CSV' do
    tmpdir = Dir.mktmpdir
    mapping_path = File.join(tmpdir, 'export.url_mapping.csv')
    DecidimImporter::LinkMap.new({ '/processes/a' => '/projects/a' }, {}, []).write_csv(mapping_path)
    layout = layout_with('<a href="/processes/a">A</a>')

    described_class.from_csv(mapping_path).run

    expect(layout_text(layout)).to include('/projects/a')
  ensure
    FileUtils.remove_entry(tmpdir)
  end
end
