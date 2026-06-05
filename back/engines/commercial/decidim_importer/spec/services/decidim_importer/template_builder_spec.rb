# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DecidimImporter::TemplateBuilder do
  let(:ref_map) { DecidimImporter::RefMap.new }

  def record(model, attributes)
    DecidimImporter::Record.new(model, attributes)
  end

  it 'emits models in dependency order regardless of registration order' do
    ref_map.register('decidim-step-1', record('phase', { 'title_multiloc' => { 'en' => 'P' } }))
    ref_map.register('decidim-user-1', record('user', { 'email' => 'a@b.co' }))
    ref_map.register('decidim-participatoryprocess-1', record('project', { 'title_multiloc' => { 'en' => 'X' } }))

    models = described_class.new(ref_map).models['models']

    expect(models.keys).to eq(%w[user project phase])
  end

  it 'counts records per model in dependency order' do
    ref_map.register('decidim-user-1', record('user', { 'email' => 'a@b.co' }))
    ref_map.register('decidim-user-2', record('user', { 'email' => 'c@d.co' }))
    ref_map.register('decidim-participatoryprocess-1', record('project', { 'title_multiloc' => { 'en' => 'X' } }))

    expect(described_class.new(ref_map).model_counts).to eq('user' => 2, 'project' => 1)
  end

  it 'shares the referenced attributes object so a YAML round-trip resolves into a ref' do
    project = record('project', { 'title_multiloc' => { 'en' => 'X' } })
    phase = record('phase', { 'title_multiloc' => { 'en' => 'P' } })
    phase.reference('project', project)
    ref_map.register('decidim-participatoryprocess-1', project)
    ref_map.register('decidim-step-1', phase)

    builder = described_class.new(ref_map)
    models = builder.models['models']
    expect(models['phase'].first['project_ref']).to be(models['project'].first)

    loaded = YAML.load(builder.to_yaml, aliases: true)
    expect(loaded['models']['phase'].first['project_ref']).to be(loaded['models']['project'].first)
  end
end
