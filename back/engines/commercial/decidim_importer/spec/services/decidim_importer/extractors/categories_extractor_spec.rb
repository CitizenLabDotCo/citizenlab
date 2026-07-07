# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DecidimImporter::Extractors::CategoriesExtractor do
  let(:ref_map) { DecidimImporter::RefMap.new }
  let(:mapper) { DecidimImporter::LocaleMapper.new }
  let(:process_uid) { 'decidim--participatory-process--14' }
  let(:project) { DecidimImporter::Record.new('project', { 'title_multiloc' => { 'fr-FR' => 'P' } }) }

  before { ref_map.register(process_uid, project) }

  def extract(rows)
    described_class.new(rows, ref_map, locale_mapper: mapper, primary_locale: 'fr-FR')
  end

  def row(overrides = {})
    {
      'uid' => 'decidim--category--15', 'decidim_participatory_process' => process_uid, 'parent' => '',
      'name' => '{"fr":"Toute la ville"}', 'description' => '{"fr":"<p>desc</p>"}', 'weight' => '0'
    }.merge(overrides)
  end

  it 'builds a project InputTopic with the name/description multilocs' do
    topic = extract([row]).run.first

    expect(topic.model_name).to eq('input_topic')
    expect(topic.attributes['title_multiloc']).to eq('fr-FR' => 'Toute la ville')
    expect(topic.attributes['description_multiloc']).to eq('fr-FR' => '<p>desc</p>')
    expect(topic.attributes['project_ref']).to be(project.attributes)
    expect(topic.attributes).not_to have_key('parent_ref')
    expect(ref_map.fetch('decidim--category--15')).to eq(topic)
  end

  it 'links a child category to its parent input topic, processing roots first' do
    rows = [
      row('uid' => 'decidim--category--2', 'parent' => 'decidim--category--1', 'name' => '{"fr":"Arbres"}'),
      row('uid' => 'decidim--category--1', 'parent' => '', 'name' => '{"fr":"Environnement"}')
    ]
    topics = extract(rows).run

    parent = ref_map.fetch('decidim--category--1')
    child = ref_map.fetch('decidim--category--2')
    # The root is emitted first even though it came second in the file.
    expect(topics.first).to eq(parent)
    expect(child.attributes['parent_ref']).to be(parent.attributes)
  end

  it 'defaults description to an empty multiloc when the category has none' do
    topic = extract([row('description' => '')]).run.first
    expect(topic.attributes['description_multiloc']).to eq({})
  end

  it 'skips a category with no name' do
    extractor = extract([row('name' => '')])
    expect(extractor.run).to be_empty
    expect(extractor.skipped.first).to include(uid: 'decidim--category--15', reason: 'category has no name')
  end

  it 'skips a category whose process was not imported as a project' do
    extractor = extract([row('decidim_participatory_process' => 'missing')])
    expect(extractor.run).to be_empty
    expect(extractor.skipped.first).to include(uid: 'decidim--category--15', reason: 'no project for category')
  end
end
