# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DecidimImporter::Extractors::BlogPostsExtractor do
  let(:ref_map) { DecidimImporter::RefMap.new }
  let(:mapper) { DecidimImporter::LocaleMapper.new }
  let(:project) { DecidimImporter::Record.new('project', { 'title_multiloc' => { 'fr-FR' => 'Rue de demain' } }) }

  before { ref_map.register('decidim--process--1', project) }

  def extract(rows)
    described_class.new(rows, ref_map, locale_mapper: mapper, primary_locale: 'fr-FR')
  end

  def row(overrides = {})
    {
      'uid' => 'decidim--blogs--post--1', 'title' => '{"fr":"Végétalisation"}',
      'body' => '{"fr":"<h5>Un projet</h5>"}', 'published_at' => '2022-07-06 16:32:12 +0200',
      'created_at' => '2022-07-06 16:32:12 +0200', 'updated_at' => '2022-07-06 16:32:36 +0200',
      'decidim_participatory_process' => 'decidim--process--1'
    }.merge(overrides)
  end

  it 'builds a custom project static page carrying the post title and body' do
    page = extract([row]).run.first

    expect(page.model_name).to eq('static_page')
    expect(page.attributes['id']).to be_present
    expect(page.attributes['code']).to eq('custom')
    expect(page.attributes['title_multiloc']).to eq('fr-FR' => 'Végétalisation')
    expect(page.attributes['top_info_section_enabled']).to be(true)
    expect(page.attributes['top_info_section_multiloc']).to eq('fr-FR' => '<h5>Un projet</h5>')
    expect(page.attributes['project_ref']).to be(project.attributes)
    expect(ref_map.fetch('decidim--blogs--post--1')).to eq(page)
  end

  it 'skips a post whose process was not imported, an unpublished post, and a titleless post' do
    expect(extract([row('decidim_participatory_process' => 'nope')]).run).to be_empty
    expect(extract([row('published_at' => '')]).run).to be_empty

    extractor = extract([row('title' => '')])
    expect(extractor.run).to be_empty
    expect(extractor.skipped.first[:reason]).to eq('post has no title')
  end
end
