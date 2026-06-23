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

  def extract(rows)
    described_class.new(rows, ref_map, locale_mapper: mapper, primary_locale: 'fr-FR').run
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

  it 'puts the description in a TextMultiloc block, then a PageLink per page, then a FileAttachment per file' do
    register_page('decidim-page-1', 'page-uuid-1')
    register_file('decidim-att-1', 'file-uuid-1')

    craftjs = extract([row]).first.attributes['craftjs_json']

    order = craftjs['ROOT']['nodes'].map { |id| craftjs[id]['type']['resolvedName'] }
    expect(order).to eq(%w[TextMultiloc PageLink FileAttachment])
    expect(nodes_named(craftjs, 'TextMultiloc').first['props']['text']).to eq('fr-FR' => '<p>Une description</p>')
    expect(nodes_named(craftjs, 'PageLink').first['props']['pageId']).to eq('page-uuid-1')
    expect(nodes_named(craftjs, 'FileAttachment').first['props']['fileId']).to eq('file-uuid-1')
  end

  it 'omits the TextMultiloc block when there is no description' do
    register_page('decidim-page-1', 'page-uuid-1')
    craftjs = extract([row('description' => '')]).first.attributes['craftjs_json']

    names = craftjs['ROOT']['nodes'].map { |id| craftjs[id]['type']['resolvedName'] }
    expect(names).to eq(%w[PageLink])
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
end
