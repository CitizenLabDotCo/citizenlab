# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DecidimImporter::Extractors::DescriptionLayoutExtractor do
  let(:ref_map) { DecidimImporter::RefMap.new }
  let(:mapper) { DecidimImporter::LocaleMapper.new }
  let(:process_uid) { 'decidim-process-1' }
  let(:project) { DecidimImporter::Record.new('project', { 'title_multiloc' => { 'fr-FR' => 'P' } }) }

  before { ref_map.register(process_uid, project) }

  def register_page(uid, id)
    page = DecidimImporter::Record.new('static_page', { 'id' => id, 'title_multiloc' => { 'fr-FR' => uid } })
    page.reference('project', project)
    ref_map.register(uid, page)
  end

  def register_file(uid, id)
    file = DecidimImporter::Record.new('files/file', { 'id' => id, 'name' => "#{uid}.pdf" })
    ref_map.register(uid, file)
    fp = DecidimImporter::Record.new('files/files_project', {})
    fp.reference('file', file)
    fp.reference('project', project)
    ref_map.register("#{uid}-fp", fp)
  end

  # A participation phase for the project — the AboutBox only appears when the project has one.
  def register_participation_phase(method = 'ideation')
    phase = DecidimImporter::Record.new('phase', { 'participation_method' => method })
    phase.reference('project', project)
    ref_map.register("phase-#{method}", phase)
  end

  def extract(rows, **opts)
    described_class.new(rows, ref_map, locale_mapper: mapper, primary_locale: 'fr-FR', **opts).run
  end

  def row(overrides = {})
    { 'uid' => process_uid, 'description' => '{"fr":"<p>Une description</p>"}' }.merge(overrides)
  end

  # craft nodes of a given component (skips ROOT, whose `type` is the plain string 'div').
  def nodes_named(craftjs, name)
    craftjs.values.select { |n| n['type'].is_a?(Hash) && n['type']['resolvedName'] == name }
  end

  it 'builds an enabled project_description layout referencing the project' do
    layout = extract([row]).first

    expect(layout.model_name).to eq('content_builder/layout')
    expect(layout.attributes).to include('code' => 'project_description', 'enabled' => true)
    expect(layout.attributes['content_buildable_ref']).to be(project.attributes)
    expect(ref_map.fetch("#{process_uid}-description-layout")).to be(layout)
  end

  # The resolved names of a node's linked-column children (left/right of a TwoColumn).
  def column_names(craftjs, two_col, side)
    craftjs[two_col['linkedNodes'][side]]['nodes'].map { |id| craftjs[id]['type']['resolvedName'] }
  end

  it 'lays out the description (left) and AboutBox + page links (right) in a 2-1 TwoColumn, files at root' do
    register_participation_phase
    register_page('decidim-page-1', 'page-uuid-1')
    register_file('decidim-att-1', 'file-uuid-1')

    craftjs = extract([row]).first.attributes['craftjs_json']

    root = craftjs['ROOT']['nodes'].map { |id| craftjs[id]['type'].is_a?(Hash) ? craftjs[id]['type']['resolvedName'] : craftjs[id]['type'] }
    expect(root).to eq(%w[TwoColumn FileAttachment]) # two-column main section, then the file at root

    two_col = nodes_named(craftjs, 'TwoColumn').first
    expect(two_col['props']['columnLayout']).to eq('2-1')
    expect(column_names(craftjs, two_col, 'left')).to eq(%w[TextMultiloc])
    expect(column_names(craftjs, two_col, 'right')).to eq(%w[AboutBox PageLink])

    expect(nodes_named(craftjs, 'TextMultiloc').first['props']['text']).to eq('fr-FR' => '<p>Une description</p>')
    expect(nodes_named(craftjs, 'PageLink').first['props']['pageId']).to eq('page-uuid-1')
    expect(nodes_named(craftjs, 'FileAttachment').first['props']['fileId']).to eq('file-uuid-1')
  end

  it 'puts the process subtitle as an H2 above the description in the left column' do
    register_participation_phase
    craftjs = extract([row('subtitle' => '{"fr":"Mon sous-titre"}')]).first.attributes['craftjs_json']

    two_col = nodes_named(craftjs, 'TwoColumn').first
    left = craftjs[two_col['linkedNodes']['left']]['nodes'].map { |id| craftjs[id] }
    expect(left.map { |n| n['type']['resolvedName'] }).to eq(%w[TextMultiloc TextMultiloc]) # subtitle H2, then description
    expect(left.first['props']['text']['fr-FR']).to eq('<h2>Mon sous-titre</h2>')
    expect(left.last['props']['text']['fr-FR']).to eq('<p>Une description</p>')
  end

  it 'lays out subtitle (H2), short description and description as separate TextMultilocs, in that order' do
    register_participation_phase
    craftjs = extract([row(
      'subtitle' => '{"fr":"Mon sous-titre"}',
      'short_description' => '{"fr":"<p>Un résumé</p>"}'
    )]).first.attributes['craftjs_json']

    two_col = nodes_named(craftjs, 'TwoColumn').first
    left = craftjs[two_col['linkedNodes']['left']]['nodes'].map { |id| craftjs[id] }
    expect(left.map { |n| n['type']['resolvedName'] }).to eq(%w[TextMultiloc TextMultiloc TextMultiloc])
    expect(left.map { |n| n['props']['text']['fr-FR'] })
      .to eq(['<h2>Mon sous-titre</h2>', '<p>Un résumé</p>', '<p>Une description</p>'])
  end

  it 'leaves the left column empty when there is no description' do
    register_participation_phase
    register_page('decidim-page-1', 'page-uuid-1')
    craftjs = extract([row('description' => '')]).first.attributes['craftjs_json']

    two_col = nodes_named(craftjs, 'TwoColumn').first
    expect(column_names(craftjs, two_col, 'left')).to be_empty
    expect(column_names(craftjs, two_col, 'right')).to eq(%w[AboutBox PageLink])
  end

  it 'shows the AboutBox only when the project has a participation phase' do
    register_page('decidim-page-1', 'page-uuid-1') # pages but no participation phase
    craftjs = extract([row]).first.attributes['craftjs_json']

    two_col = nodes_named(craftjs, 'TwoColumn').first
    # Right column has the page link but no AboutBox.
    expect(column_names(craftjs, two_col, 'right')).to eq(%w[PageLink])
    expect(nodes_named(craftjs, 'AboutBox')).to be_empty
  end

  it 'renders the description full width (no TwoColumn) when there is no AboutBox or page link' do
    # Description only: no participation phase, no pages → nothing for a side column.
    craftjs = extract([row]).first.attributes['craftjs_json']

    expect(nodes_named(craftjs, 'TwoColumn')).to be_empty
    root = craftjs['ROOT']['nodes'].map { |id| craftjs[id]['type'].is_a?(Hash) ? craftjs[id]['type']['resolvedName'] : craftjs[id]['type'] }
    expect(root).to eq(%w[TextMultiloc]) # the description, full width
  end

  it 'builds no layout for a project with no description, pages or files' do
    expect(extract([row('description' => '')])).to be_empty
  end

  it 'only links the pages and files of its own project' do
    other = DecidimImporter::Record.new('project', { 'title_multiloc' => { 'fr-FR' => 'Other' } })
    ref_map.register('decidim-process-2', other)
    register_page('decidim-page-1', 'page-uuid-1') # belongs to `project`
    other_page = DecidimImporter::Record.new('static_page', { 'id' => 'page-uuid-2' })
    other_page.reference('project', other)
    ref_map.register('decidim-page-2', other_page)

    craftjs = extract([row]).first.attributes['craftjs_json']
    expect(nodes_named(craftjs, 'PageLink').map { |n| n['props']['pageId'] }).to eq(['page-uuid-1'])
  end

  context 'when include_source_url is on' do
    let(:source_row) { row('url' => 'https://decidim.example/processes/p1') }

    it 'puts the import-source link at the bottom of the right column, after a WhiteSpace' do
      register_participation_phase # so the right column also has the AboutBox
      craftjs = extract([source_row], include_source_url: true).first.attributes['craftjs_json']

      two_col = nodes_named(craftjs, 'TwoColumn').first
      right = craftjs[two_col['linkedNodes']['right']]['nodes'].map { |id| craftjs[id] }
      # AboutBox first, then the white space, then the source link.
      expect(right.map { |n| n['type']['resolvedName'] }).to eq(%w[AboutBox WhiteSpace TextMultiloc])
      expect(right[1]['props']).to eq('size' => 'medium')
      expect(right.last['props']['text']['fr-FR'])
        .to eq('<p>Import source: <a href="https://decidim.example/processes/p1" ' \
               'target="_blank" rel="noreferrer noopener nofollow">https://decidim.example/processes/p1</a></p>')
    end

    it 'builds a two-column with the WhiteSpace + source link in the right column when there is nothing else' do
      craftjs = extract([source_row.merge('description' => '')], include_source_url: true).first
        .attributes['craftjs_json']

      two_col = nodes_named(craftjs, 'TwoColumn').first
      expect(craftjs[two_col['linkedNodes']['left']]['nodes']).to be_empty
      expect(column_names(craftjs, two_col, 'right')).to eq(%w[WhiteSpace TextMultiloc])
    end

    it 'adds no source block when the row has no url' do
      craftjs = extract([row], include_source_url: true).first.attributes['craftjs_json']
      expect(nodes_named(craftjs, 'TextMultiloc').size).to eq(1)
    end
  end

  it 'adds no source block when include_source_url is off, even with a url' do
    craftjs = extract([row('url' => 'https://decidim.example/processes/p1')]).first.attributes['craftjs_json']
    expect(nodes_named(craftjs, 'TextMultiloc').size).to eq(1)
  end

  describe 'attachment collections as accordions' do
    def collection(uid, name, weight, for_process: process_uid, description: '')
      { 'uid' => uid, 'name' => name, 'description' => description, 'weight' => weight.to_s,
        'collection_for' => for_process }
    end

    it 'nests a collection\'s files in an AccordionMultiloc and leaves collection-less files at root' do
      register_file('att-1', 'file-1') # belongs to collection coll-5
      register_file('att-2', 'file-2') # no collection
      attachments = [{ 'uid' => 'att-1', 'collection' => 'coll-5' }, { 'uid' => 'att-2', 'collection' => '' }]
      collections = [collection('coll-5', '{"fr":"Rapports"}', 0, description: '{"fr":"<p>Les rapports</p>"}')]

      craftjs = extract([row], attachments: attachments, attachment_collections: collections).first.attributes['craftjs_json']

      # The collection-less file sits at root; the collected file does not.
      root_files = nodes_named(craftjs, 'FileAttachment').select { |n| n['parent'] == 'ROOT' }
      expect(root_files.map { |n| n['props']['fileId'] }).to eq(['file-2'])

      # The accordion is a root child, titled with the (localized) collection name, nesting its content
      # in a linked Container canvas.
      accordion = nodes_named(craftjs, 'AccordionMultiloc').first
      expect(accordion['parent']).to eq('ROOT')
      expect(accordion['props']['title']).to eq('fr-FR' => 'Rapports')
      expect(craftjs['ROOT']['nodes']).to include(craftjs.key(accordion))

      canvas = craftjs[accordion['linkedNodes']['accordion-content']]
      expect(canvas['type']['resolvedName']).to eq('Container')
      expect(canvas['isCanvas']).to be(true)
      # Content: the collection description (TextMultiloc) first, then the file.
      nested = canvas['nodes'].map { |id| craftjs[id] }
      expect(nested.map { |n| n['type']['resolvedName'] }).to eq(%w[TextMultiloc FileAttachment])
      expect(nested.first['props']['text']).to eq('fr-FR' => '<p>Les rapports</p>')
      expect(nested.last['props']['fileId']).to eq('file-1')
      expect(nested.last['parent']).to eq(accordion['linkedNodes']['accordion-content'])
    end

    it 'puts an H2 "Documents to consult" heading directly above the accordions' do
      register_file('att-1', 'file-1')
      attachments = [{ 'uid' => 'att-1', 'collection' => 'coll-5' }]

      craftjs = extract([row],
        attachments: attachments,
        attachment_collections: [collection('coll-5', '{"fr":"Rapports"}', 0)]).first.attributes['craftjs_json']

      root = craftjs['ROOT']['nodes'].map { |id| [id, craftjs[id]] }
      heading_index = root.index { |_id, node| node.dig('props', 'text', 'fr-FR').to_s.start_with?('<h2>') }
      accordion_index = root.index { |_id, node| node['type'].is_a?(Hash) && node['type']['resolvedName'] == 'AccordionMultiloc' }

      expect(heading_index).not_to be_nil
      expect(heading_index).to eq(accordion_index - 1) # immediately above the accordions
      # Translated via the back-end key (en fallback for fr-FR until Polyglit adds French), wrapped in <h2>.
      heading_text = root[heading_index].last['props']['text']['fr-FR']
      expect(heading_text).to eq("<h2>#{I18n.t('decidim_importer.documents_to_consult', locale: 'fr-FR')}</h2>")
    end

    it 'adds no documents heading when the project has no collections' do
      register_file('att-1', 'file-1')
      craftjs = extract([row], attachments: [{ 'uid' => 'att-1', 'collection' => '' }],
        attachment_collections: []).first.attributes['craftjs_json']
      expect(nodes_named(craftjs, 'TextMultiloc').map { |n| n['props']['text']['fr-FR'] }.join).not_to include('<h2>')
    end

    it 'omits the description TextMultiloc when the collection has none' do
      register_file('att-1', 'file-1')
      attachments = [{ 'uid' => 'att-1', 'collection' => 'coll-5' }]

      craftjs = extract([row],
        attachments: attachments,
        attachment_collections: [collection('coll-5', '{"fr":"Rapports"}', 0)]).first.attributes['craftjs_json']

      canvas = craftjs[nodes_named(craftjs, 'AccordionMultiloc').first['linkedNodes']['accordion-content']]
      expect(canvas['nodes'].map { |id| craftjs[id]['type']['resolvedName'] }).to eq(%w[FileAttachment])
    end

    it 'orders accordions by collection weight' do
      register_file('att-1', 'file-1')
      register_file('att-2', 'file-2')
      attachments = [{ 'uid' => 'att-1', 'collection' => 'coll-a' }, { 'uid' => 'att-2', 'collection' => 'coll-b' }]
      collections = [collection('coll-a', '{"fr":"A"}', 5), collection('coll-b', '{"fr":"B"}', 1)]

      craftjs = extract([row], attachments: attachments, attachment_collections: collections).first.attributes['craftjs_json']
      titles = nodes_named(craftjs, 'AccordionMultiloc').map { |n| n['props']['title']['fr-FR'] }
      expect(titles).to eq(%w[B A]) # weight 1 before weight 5
    end

    it 'keeps a file at root when its collection is not among the project\'s collections' do
      register_file('att-1', 'file-1')
      attachments = [{ 'uid' => 'att-1', 'collection' => 'coll-unknown' }]

      craftjs = extract([row], attachments: attachments, attachment_collections: []).first.attributes['craftjs_json']
      expect(nodes_named(craftjs, 'AccordionMultiloc')).to be_empty
      expect(nodes_named(craftjs, 'FileAttachment').map { |n| n['props']['fileId'] }).to eq(['file-1'])
    end
  end
end
