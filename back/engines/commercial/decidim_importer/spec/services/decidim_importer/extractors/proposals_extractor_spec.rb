# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DecidimImporter::Extractors::ProposalsExtractor do
  let(:ref_map) { DecidimImporter::RefMap.new }
  let(:mapper) { DecidimImporter::LocaleMapper.new }
  let(:process_uid) { 'decidim-process-1' }
  let(:component_uid) { 'decidim-component-1' }
  let(:project) { DecidimImporter::Record.new('project', { 'title_multiloc' => { 'fr-FR' => 'P' } }) }
  let(:phase) { DecidimImporter::Record.new('phase', { 'participation_method' => 'ideation' }) }

  before do
    ref_map.register(process_uid, project)
    ref_map.register(component_uid, phase)
    ref_map.register('decidim-user-1', DecidimImporter::Record.new('user', { 'email' => 'a@b.co' }))
    ref_map.register('decidim-user-2', DecidimImporter::Record.new('user', { 'email' => 'c@d.co' }))
  end

  def extract(rows)
    described_class.new(rows, ref_map, locale_mapper: mapper, primary_locale: 'fr-FR').run
  end

  def row(overrides = {})
    {
      'uid' => 'decidim-proposal-1', 'decidim_participatory_process' => process_uid,
      'decidim_component' => component_uid, 'authors' => '["decidim-user-1"]',
      'title' => '{"fr":"Idée"}', 'body' => '{"fr":"<p>Corps</p>"}',
      'state_token' => 'accepted', 'published_at' => '2023-02-10 09:00:00 +0100'
    }.merge(overrides)
  end

  it 'builds a published idea with mapped status code, title/body and author from the first uid' do
    attrs = extract([row]).first.attributes

    expect(attrs['title_multiloc']).to eq('fr-FR' => 'Idée')
    expect(attrs['body_multiloc']['fr-FR']).to include('Corps')
    expect(attrs['publication_status']).to eq('published')
    expect(attrs['idea_status_code']).to eq('accepted')
    expect(attrs['project_ref']).to be(project.attributes)
    expect(attrs['author_ref']).to be(ref_map.fetch('decidim-user-1').attributes)
    expect(attrs).not_to have_key('creation_phase_ref') # ideation is transitive
    # All dates come from the export's publication date, not the import time.
    expect(attrs.values_at('created_at', 'published_at', 'submitted_at')).to all(eq('2023-02-10 09:00:00 +0100'))
  end

  it 'registers an ideas_phase join linking the idea to its phase' do
    idea = extract([row]).first
    join = ref_map.fetch('decidim-proposal-1-ideas-phase')

    expect(join.model_name).to eq('ideas_phase')
    expect(join.attributes['idea_ref']).to be(idea.attributes)
    expect(join.attributes['phase_ref']).to be(phase.attributes)
  end

  it 'tags the idea with its category via an ideas_input_topic join' do
    topic = ref_map.register('decidim--category--2', DecidimImporter::Record.new('input_topic', {}))
    idea = extract([row('category' => 'decidim--category--2')]).first
    join = ref_map.fetch('decidim-proposal-1-ideas-input-topic')

    expect(join.model_name).to eq('ideas_input_topic')
    expect(join.attributes['idea_ref']).to be(idea.attributes)
    expect(join.attributes['input_topic_ref']).to be(topic.attributes)
  end

  it 'does not tag the idea when its category was not imported' do
    extract([row('category' => 'decidim--category--999')])
    expect(ref_map.fetch('decidim-proposal-1-ideas-input-topic')).to be_nil
  end

  it 'leaves the idea author-less when no author uid resolves to an imported user' do
    attrs = extract([row('authors' => '["decidim-user-999","decidim-meetings-meeting-3"]')]).first.attributes
    expect(attrs).not_to have_key('author_ref')
  end

  it 'picks the first author uid that resolves to a user' do
    attrs = extract([row('authors' => '["decidim-meetings-meeting-3","decidim-user-2"]')]).first.attributes
    expect(attrs['author_ref']).to be(ref_map.fetch('decidim-user-2').attributes)
  end

  it 'maps a present admin answer to an official feedback, and emits none otherwise' do
    extract([row('answer' => '{"fr":"<p>Réponse</p>"}')])
    feedback = ref_map.fetch('decidim-proposal-1-official-feedback')
    expect(feedback.attributes['body_multiloc']['fr-FR']).to include('Réponse')
    expect(feedback.attributes['author_multiloc']).to eq('fr-FR' => 'Administration')
    expect(feedback.attributes['idea_ref']).to be(ref_map.fetch('decidim-proposal-1').attributes)

    ref_map_without = DecidimImporter::RefMap.new
    ref_map_without.register(process_uid, project)
    ref_map_without.register(component_uid, phase)
    described_class.new([row], ref_map_without, locale_mapper: mapper, primary_locale: 'fr-FR').run
    expect(ref_map_without.fetch('decidim-proposal-1-official-feedback')).to be_nil
  end

  it 'skips a proposal whose project or phase was not imported' do
    extractor = described_class.new(
      [row('decidim_component' => 'missing')], ref_map, locale_mapper: mapper, primary_locale: 'fr-FR'
    )
    expect(extractor.run).to be_empty
    expect(extractor.skipped.first).to include(uid: 'decidim-proposal-1')
  end
end
