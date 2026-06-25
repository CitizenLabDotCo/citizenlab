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

  describe '#counts_by_project' do
    it 'groups counts under each record\'s owning project, following refs (and files via the join)' do
      project_a = record('project', { 'title_multiloc' => { 'fr-FR' => 'Projet A' } })
      project_b = record('project', { 'title_multiloc' => { 'fr-FR' => 'Projet B' } })
      ref_map.register('proc-a', project_a)
      ref_map.register('proc-b', project_b)
      ref_map.register('user-1', record('user', { 'email' => 'a@b.co' })) # not project-scoped

      # Project A: a phase, an idea (direct ref) and a comment that only reaches A through its idea.
      phase = record('phase', {}).tap { |r| r.reference('project', project_a) }
      idea = record('idea', {}).tap { |r| r.reference('project', project_a) }
      comment = record('comment', {}).tap { |r| r.reference('idea', idea) }
      ref_map.register('phase-a', phase)
      ref_map.register('idea-a', idea)
      ref_map.register('comment-a', comment)

      # Project B: a file, tied to B only via the files_project join (the file has no project ref).
      file = record('files/file', { 'name' => 'doc.pdf' })
      files_project = record('files/files_project', {})
      files_project.reference('file', file)
      files_project.reference('project', project_b)
      ref_map.register('file-b', file)
      ref_map.register('fp-b', files_project)

      counts = described_class.new(ref_map).counts_by_project

      expect(counts[project_a]).to eq('project' => 1, 'phase' => 1, 'idea' => 1, 'comment' => 1)
      expect(counts[project_b]).to eq('project' => 1, 'files/file' => 1, 'files/files_project' => 1)
      expect(counts[nil]).to eq('user' => 1)
    end
  end
end
