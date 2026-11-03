# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DecidimImporter::Extractors::ProposalVotesExtractor do
  let(:ref_map) { DecidimImporter::RefMap.new }
  let(:mapper) { DecidimImporter::LocaleMapper.new }
  let(:phase) { DecidimImporter::Record.new('phase', { 'participation_method' => 'voting' }) }
  let(:idea1) { DecidimImporter::Record.new('idea', { 'title_multiloc' => { 'fr-FR' => 'A' } }) }
  let(:idea2) { DecidimImporter::Record.new('idea', { 'title_multiloc' => { 'fr-FR' => 'B' } }) }

  before do
    ref_map.register('decidim--component--100', phase)
    ref_map.register('decidim--user--1', DecidimImporter::Record.new('user', { 'email' => 'a@b.c' }))
    ref_map.register('decidim--proposals--proposal--1', idea1)
    ref_map.register('decidim--proposals--proposal--2', idea2)
  end

  def extract(rows)
    described_class.new(rows, ref_map, locale_mapper: mapper, primary_locale: 'fr-FR')
  end

  def vote(overrides = {})
    {
      'uid' => 'decidim--proposals--proposal-vote--1', 'decidim_component' => 'decidim--component--100',
      'proposal' => 'decidim--proposals--proposal--1', 'author' => 'decidim--user--1',
      'created_at' => '2022-09-03 10:00:00 +0200', 'updated_at' => '2022-09-03 10:00:00 +0200'
    }.merge(overrides)
  end

  # The baskets_ideas built for a basket (they reference it by shared attributes hash).
  def baskets_ideas_for(basket)
    ref_map.records.select do |record|
      record.model_name == 'baskets_idea' && record.attributes['basket_ref'].equal?(basket.attributes)
    end
  end

  it 'collapses a voter’s rows into one submitted basket with a one-vote pick per idea' do
    basket = extract([
      vote,
      vote('uid' => 'decidim--proposals--proposal-vote--2', 'proposal' => 'decidim--proposals--proposal--2',
        'created_at' => '2022-09-03 10:30:00 +0200')
    ]).run.first

    expect(basket.model_name).to eq('basket')
    expect(basket.attributes['phase_ref']).to be(phase.attributes)
    expect(basket.attributes['user_ref']).to be(ref_map.fetch('decidim--user--1').attributes)
    # Dated from the votes: earliest → created_at, latest → submitted_at (so it counts as submitted).
    expect(basket.attributes['created_at']).to eq('2022-09-03 10:00:00 +0200')
    expect(basket.attributes['submitted_at']).to eq('2022-09-03 10:30:00 +0200')

    picks = baskets_ideas_for(basket)
    expect(picks.map { |bi| bi.attributes['votes'] }).to eq([1, 1])
    expect(picks.map { |bi| bi.attributes['idea_ref'] }).to contain_exactly(idea1.attributes, idea2.attributes)
  end

  it 'keeps a vote by a non-imported user as a user-less basket' do
    basket = extract([vote('author' => 'decidim--user--999')]).run.first
    expect(basket.attributes).not_to have_key('user_ref')
    expect(baskets_ideas_for(basket).size).to eq(1)
  end

  it 'drops picks whose proposal was not imported' do
    basket = extract([
      vote,
      vote('uid' => 'decidim--proposals--proposal-vote--9', 'proposal' => 'nope')
    ]).run.first
    expect(baskets_ideas_for(basket).map { |bi| bi.attributes['idea_ref'] }).to eq([idea1.attributes])
  end

  it 'builds one basket per voter' do
    baskets = extract([
      vote,
      vote('uid' => 'decidim--proposals--proposal-vote--2', 'author' => 'decidim--user--1',
        'proposal' => 'decidim--proposals--proposal--2'),
      vote('uid' => 'decidim--proposals--proposal-vote--3', 'author' => 'decidim--user--999')
    ]).run
    expect(baskets.size).to eq(2) # user-1 (2 picks, 1 basket) + the anonymous voter
  end

  it 'skips a vote whose component is not a voting phase' do
    ideation = DecidimImporter::Record.new('phase', { 'participation_method' => 'ideation' })
    ref_map.register('decidim--component--200', ideation)
    extractor = extract([vote('decidim_component' => 'decidim--component--200')])

    expect(extractor.run).to be_empty
    expect(extractor.skipped.first[:reason]).to eq('no voting phase for proposal vote')
  end

  it 'skips a voter whose picks were all unimported proposals' do
    extractor = extract([vote('proposal' => 'nope')])
    expect(extractor.run).to be_empty
    expect(extractor.skipped.first[:reason]).to eq('no imported proposal voted')
  end
end
