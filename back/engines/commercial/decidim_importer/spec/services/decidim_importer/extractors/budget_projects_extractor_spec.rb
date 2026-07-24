# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DecidimImporter::Extractors::BudgetProjectsExtractor do
  let(:ref_map) { DecidimImporter::RefMap.new }
  let(:mapper) { DecidimImporter::LocaleMapper.new }
  let(:project) { DecidimImporter::Record.new('project', { 'title_multiloc' => { 'fr-FR' => 'P' } }) }
  let(:phase) { DecidimImporter::Record.new('phase', { 'participation_method' => 'voting' }) }

  before do
    ref_map.register('decidim--process--10', project)
    ref_map.register('decidim--component--63', phase)
  end

  def extract(rows)
    described_class.new(rows, ref_map, locale_mapper: mapper, primary_locale: 'fr-FR')
  end

  def row(overrides = {})
    {
      'uid' => 'decidim--budgets--project--1', 'decidim_participatory_process' => 'decidim--process--10',
      'decidim_component' => 'decidim--component--63', 'title' => '{"fr":"Activité"}',
      'description' => '{"fr":"<p>desc</p>"}', 'budget_amount' => '30000', 'address' => '1 rue X',
      'category' => '', 'created_at' => '2024-05-29 14:58:16 +0200', 'updated_at' => '2024-05-29 14:58:16 +0200'
    }.merge(overrides)
  end

  it 'builds an idea in the voting phase carrying the budget amount and address' do
    idea = extract([row]).run.first

    expect(idea.model_name).to eq('idea')
    expect(idea.attributes['title_multiloc']).to eq('fr-FR' => 'Activité')
    expect(idea.attributes['budget']).to eq(30_000)
    expect(idea.attributes['location_description']).to eq('1 rue X')
    expect(idea.attributes['publication_status']).to eq('published')
    expect(idea.attributes['project_ref']).to be(project.attributes)

    join = ref_map.fetch('decidim--budgets--project--1-ideas-phase')
    expect(join.model_name).to eq('ideas_phase')
    expect(join.attributes['phase_ref']).to be(phase.attributes)
    expect(join.attributes['idea_ref']).to be(idea.attributes)
  end

  it 'omits the budget when the project has no amount' do
    idea = extract([row('budget_amount' => '')]).run.first
    expect(idea.attributes).not_to have_key('budget')
  end

  it 'skips a budget project whose project/phase was not imported' do
    extractor = extract([row('decidim_component' => 'decidim--component--999')])
    expect(extractor.run).to be_empty
    expect(extractor.skipped.first).to include(uid: 'decidim--budgets--project--1', reason: 'no project/phase for budget project')
  end
end
