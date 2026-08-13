# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DecidimImporter::Extractors::DebatesExtractor do
  let(:ref_map) { DecidimImporter::RefMap.new }
  let(:mapper) { DecidimImporter::LocaleMapper.new }
  let(:process_uid) { 'decidim--participatory-process--2' }
  let(:component_uid) { 'decidim--component--62' }
  let(:project) { DecidimImporter::Record.new('project', { 'title_multiloc' => { 'fr-FR' => 'P' } }) }
  let(:phase) { DecidimImporter::Record.new('phase', { 'participation_method' => 'ideation' }) }

  before do
    ref_map.register(process_uid, project)
    ref_map.register(component_uid, phase)
    ref_map.register('decidim--user--1', DecidimImporter::Record.new('user', { 'email' => 'a@b.co' }))
  end

  def extract(rows)
    described_class.new(rows, ref_map, locale_mapper: mapper, primary_locale: 'fr-FR')
  end

  def row(overrides = {})
    {
      'uid' => 'decidim--debates--debate--4', 'decidim_participatory_process' => process_uid,
      'decidim_component' => component_uid, 'author' => 'decidim--user--1', 'category' => '',
      'title' => '{"fr":"Chiens en ville"}', 'description' => '{"fr":"<p>Qui est prêt ?</p>"}',
      'instructions' => '', 'information_updates' => '', 'conclusions' => '',
      'created_at' => '2021-12-01 09:00:00 UTC', 'updated_at' => '2021-12-03 09:00:00 UTC'
    }.merge(overrides)
  end

  it 'builds a published, proposed idea in the debate phase, dated by created_at' do
    idea = extract([row]).run.first
    attrs = idea.attributes

    expect(idea.model_name).to eq('idea')
    expect(attrs['title_multiloc']).to eq('fr-FR' => 'Chiens en ville')
    expect(attrs['body_multiloc']['fr-FR']).to eq('<p>Qui est prêt ?</p>')
    expect(attrs['publication_status']).to eq('published')
    expect(attrs['idea_status_code']).to eq('proposed') # debates have no state
    expect(attrs['project_ref']).to be(project.attributes)
    expect(attrs['author_ref']).to be(ref_map.fetch('decidim--user--1').attributes)
    # created/published/submitted all from created_at; updated_at from the debate's own
    expect(attrs.values_at('created_at', 'published_at', 'submitted_at')).to all(eq('2021-12-01 09:00:00 UTC'))
    expect(attrs['updated_at']).to eq('2021-12-03 09:00:00 UTC')

    # ideation is transitive → linked to the phase via an ideas_phase join, not creation_phase
    expect(attrs).not_to have_key('creation_phase_ref')
    join = ref_map.fetch('decidim--debates--debate--4-ideas-phase')
    expect(join.attributes.values_at('idea_ref', 'phase_ref')).to eq([idea.attributes, phase.attributes])
  end

  it 'folds instructions/information_updates/conclusions into the body under <h3> headings, keeping order' do
    idea = extract([row(
      'instructions' => '{"fr":"<p>Restez courtois</p>"}',
      'information_updates' => '{"fr":"<p>Débat prolongé</p>"}',
      'conclusions' => '{"fr":"<p>Merci à tous</p>"}'
    )]).run.first
    body = idea.attributes['body_multiloc']['fr-FR']

    instructions = I18n.t('decidim_importer.debate_instructions', locale: 'fr-FR')
    updates = I18n.t('decidim_importer.debate_information_updates', locale: 'fr-FR')
    conclusions = I18n.t('decidim_importer.debate_conclusions', locale: 'fr-FR')
    expect(body).to eq(
      '<p>Qui est prêt ?</p>' \
      "<h3>#{instructions}</h3><p>Restez courtois</p>" \
      "<h3>#{updates}</h3><p>Débat prolongé</p>" \
      "<h3>#{conclusions}</h3><p>Merci à tous</p>"
    )
  end

  it 'omits an empty section (no heading) but keeps the ones with content' do
    idea = extract([row('conclusions' => '{"fr":"<p>Fin</p>"}')]).run.first
    body = idea.attributes['body_multiloc']['fr-FR']

    expect(body).to eq("<p>Qui est prêt ?</p><h3>#{I18n.t('decidim_importer.debate_conclusions', locale: 'fr-FR')}</h3><p>Fin</p>")
    expect(body).not_to include(I18n.t('decidim_importer.debate_instructions', locale: 'fr-FR'))
  end

  it 'tags the idea with the category input topic when it was imported' do
    topic = DecidimImporter::Record.new('input_topic', { 'title_multiloc' => { 'fr-FR' => 'Environnement' } })
    ref_map.register('decidim--category--9', topic)

    extract([row('category' => 'decidim--category--9')]).run
    join = ref_map.fetch('decidim--debates--debate--4-ideas-input-topic')
    expect(join.attributes['input_topic_ref']).to be(topic.attributes)
  end

  it 'leaves the idea author-less when the author was not imported' do
    attrs = extract([row('author' => 'decidim--user--999')]).run.first.attributes
    expect(attrs).not_to have_key('author_ref')
  end

  it 'skips a debate whose project/phase was not imported' do
    extractor = extract([row('decidim_component' => 'missing')])
    expect(extractor.run).to be_empty
    expect(extractor.skipped.first).to include(uid: 'decidim--debates--debate--4', reason: 'no project/phase for debate')
  end

  it 'skips a debate with no title' do
    extractor = extract([row('title' => '')])
    expect(extractor.run).to be_empty
    expect(extractor.skipped.first[:reason]).to eq('debate has no title')
  end
end
