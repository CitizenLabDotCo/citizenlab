# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DecidimImporter::Extractors::ResultsExtractor do
  let(:ref_map) { DecidimImporter::RefMap.new }
  let(:mapper) { DecidimImporter::LocaleMapper.new }
  let(:process_uid) { 'decidim--participatory-process--10' }
  let(:component_uid) { 'decidim--component--65' }
  let(:project) { DecidimImporter::Record.new('project', { 'title_multiloc' => { 'fr-FR' => 'P' } }) }
  let(:phase) { DecidimImporter::Record.new('phase', { 'participation_method' => 'ideation' }) }

  # Two statuses in the component: one at 40% (À l'étude), one at 100% (Réalisé).
  let(:statuses) do
    [
      { 'uid' => 'st-40', 'name' => '{"fr":"À l\'étude"}', 'description' => '{"fr":"En cours d\'analyse"}',
        'progress' => '40', 'decidim_component' => component_uid },
      { 'uid' => 'st-100', 'name' => '{"fr":"Réalisé"}', 'description' => '{"fr":"Projet terminé"}',
        'progress' => '100', 'decidim_component' => component_uid }
    ]
  end

  before do
    ref_map.register(process_uid, project)
    ref_map.register(component_uid, phase)
  end

  def extract(rows)
    described_class.new(rows, ref_map, locale_mapper: mapper, primary_locale: 'fr-FR', statuses: statuses)
  end

  def row(overrides = {})
    {
      'uid' => 'decidim--accountability--result--15', 'decidim_participatory_process' => process_uid,
      'decidim_component' => component_uid, 'category' => '',
      'title' => '{"fr":"Une fontaine"}', 'description' => '{"fr":"<p>Corps</p>"}',
      'status' => 'st-100', 'progress' => '100.0',
      'created_at' => '2024-05-01 10:00:00 +0200', 'updated_at' => '2024-06-01 10:00:00 +0200'
    }.merge(overrides)
  end

  it 'builds a published, author-less idea dated by the result, with the default status' do
    idea = extract([row]).run.first
    attrs = idea.attributes

    expect(idea.model_name).to eq('idea')
    expect(attrs['title_multiloc']).to eq('fr-FR' => 'Une fontaine')
    expect(attrs['publication_status']).to eq('published')
    expect(attrs['idea_status_code']).to eq('proposed')
    expect(attrs).not_to have_key('author_ref')
    expect(attrs.values_at('created_at', 'published_at', 'submitted_at')).to all(eq('2024-05-01 10:00:00 +0200'))
  end

  it 'prepends a bulleted Progress + Status block (status name - description) to the description' do
    body = extract([row]).run.first.attributes['body_multiloc']['fr-FR']
    expect(body).to eq(
      '<ul><li><strong>Progress:</strong> 100% </li>' \
      '<li><strong>Status:</strong> Réalisé - Projet terminé</li></ul><p>Corps</p>'
    )
  end

  it 'keeps a space after the % so the lines do not run together in plain text' do
    body = extract([row]).run.first.attributes['body_multiloc']['fr-FR']
    expect(body).to include('100% </li>') # trailing space before the list item closes
  end

  it 'maps the status by the progress %, not the stored status, when they disagree' do
    # The result sits at 100% but its stored status is the 40% one — the % wins.
    body = extract([row('status' => 'st-40', 'progress' => '100.0')]).run.first.attributes['body_multiloc']['fr-FR']
    expect(body).to include('<li><strong>Status:</strong> Réalisé - Projet terminé</li>')
  end

  it 'falls back to the result’s own status when no status sits at its progress %' do
    body = extract([row('status' => 'st-40', 'progress' => '40.0')]).run.first.attributes['body_multiloc']['fr-FR']
    expect(body).to include("<li><strong>Status:</strong> À l'étude - En cours d'analyse</li>")
  end

  it 'shows only the Progress line when the progress matches no status and the result has none' do
    body = extract([row('status' => '', 'progress' => '55.0')]).run.first.attributes['body_multiloc']['fr-FR']
    expect(body).to eq('<ul><li><strong>Progress:</strong> 55% </li></ul><p>Corps</p>')
  end

  it 'leaves the description untouched when the result has no progress' do
    body = extract([row('progress' => '')]).run.first.attributes['body_multiloc']['fr-FR']
    expect(body).to eq('<p>Corps</p>')
  end

  it 'links the idea to its phase and tags it with its category' do
    ref_map.register('decidim--category--3', DecidimImporter::Record.new('input_topic', {}))
    idea = extract([row('category' => 'decidim--category--3')]).run.first

    phase_join = ref_map.fetch('decidim--accountability--result--15-ideas-phase')
    expect(phase_join.attributes['phase_ref']).to be(phase.attributes)
    topic_join = ref_map.fetch('decidim--accountability--result--15-ideas-input-topic')
    expect(topic_join.attributes['idea_ref']).to be(idea.attributes)
  end

  it 'skips a result whose process/phase was not imported' do
    extractor = extract([row('decidim_component' => 'missing')])
    expect(extractor.run).to be_empty
    expect(extractor.skipped.first).to include(uid: 'decidim--accountability--result--15', reason: 'no project/phase for result')
  end
end
