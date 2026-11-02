# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DecidimImporter::Extractors::StaticPagesExtractor do
  let(:ref_map) { DecidimImporter::RefMap.new }
  let(:mapper) { DecidimImporter::LocaleMapper.new }
  let(:process_uid) { 'decidim-process-1' }
  let(:project) { DecidimImporter::Record.new('project', { 'title_multiloc' => { 'fr-FR' => 'P' } }) }

  before { ref_map.register(process_uid, project) }

  def extract(rows)
    described_class.new(rows, ref_map, locale_mapper: mapper, primary_locale: 'fr-FR').run
  end

  def row(overrides = {})
    {
      'uid' => 'decidim-component-1', 'type' => 'pages',
      'decidim_participatory_process' => process_uid,
      'name' => '{"fr":"La concertation"}',
      'published_at' => '2023-02-01 10:00:00 +0100',
      'specific_data' => '{"body":{"fr":"<p>Contenu de la page.</p>"}}'
    }.merge(overrides)
  end

  it 'builds a custom, project-scoped static page' do
    page = extract([row]).first

    expect(page.model_name).to eq('static_page')
    attrs = page.attributes
    expect(attrs['title_multiloc']).to eq('fr-FR' => 'La concertation')
    expect(attrs['code']).to eq('custom')
    expect(attrs['project_ref']).to be(project.attributes)
    expect(attrs).not_to include('top_info_section_enabled', 'top_info_section_multiloc')
  end

  it 'puts the body in a custom page layout for the page' do
    page = extract([row]).first

    layout = ref_map.fetch('decidim-component-1-layout')
    expect(layout.model_name).to eq('content_builder/layout')
    expect(layout.attributes).to include('code' => 'custom_page', 'enabled' => true)
    expect(layout.attributes['content_buildable_ref']).to be(page.attributes)
    expect(layout.attributes['craftjs_json']).to eq(
      ContentBuilder::CustomPageLayoutService.new.craftjs_json_for_body('fr-FR' => '<p>Contenu de la page.</p>')
    )
  end

  it 'registers the page under its component uid' do
    page = extract([row]).first
    expect(ref_map.fetch('decidim-component-1')).to be(page)
  end

  it 'skips an unpublished page (Decidim draft)' do
    extractor = described_class.new([row('published_at' => '')], ref_map, locale_mapper: mapper, primary_locale: 'fr-FR')
    expect(extractor.run).to be_empty
    expect(extractor.skipped.first).to include(uid: 'decidim-component-1', reason: 'unpublished page')
  end

  it 'skips a page whose owning process was not imported as a project' do
    extractor = described_class.new(
      [row('decidim_participatory_process' => 'missing')], ref_map, locale_mapper: mapper, primary_locale: 'fr-FR'
    )
    expect(extractor.run).to be_empty
    expect(extractor.skipped.first).to include(uid: 'decidim-component-1', reason: 'no project for page')
  end
end
