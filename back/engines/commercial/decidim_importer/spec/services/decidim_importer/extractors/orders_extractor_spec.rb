# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DecidimImporter::Extractors::OrdersExtractor do
  let(:ref_map) { DecidimImporter::RefMap.new }
  let(:mapper) { DecidimImporter::LocaleMapper.new }
  let(:phase) { DecidimImporter::Record.new('phase', { 'participation_method' => 'voting' }) }
  let(:user) { DecidimImporter::Record.new('user', { 'email' => 'a@b.c' }) }
  let(:idea1) { DecidimImporter::Record.new('idea', { 'budget' => 30_000 }) }
  let(:idea2) { DecidimImporter::Record.new('idea', { 'budget' => 15_000 }) }

  before do
    ref_map.register('decidim--component--63', phase)
    ref_map.register('decidim--user--882', user)
    ref_map.register('decidim--budgets--project--1', idea1)
    ref_map.register('decidim--budgets--project--7', idea2)
  end

  def extract(rows)
    described_class.new(rows, ref_map, locale_mapper: mapper, primary_locale: 'fr-FR')
  end

  def row(overrides = {})
    {
      'uid' => 'decidim--budgets--order--1', 'decidim_component' => 'decidim--component--63',
      'user' => 'decidim--user--882',
      'projects' => '["decidim--budgets--project--1","decidim--budgets--project--7"]',
      'checked_out_at' => '2024-06-03 12:45:21 +0200', 'created_at' => '2024-06-03 12:05:51 +0200',
      'updated_at' => '2024-06-03 12:45:21 +0200'
    }.merge(overrides)
  end

  it 'builds a submitted basket with a baskets_idea per pick, votes = the idea budget' do
    basket = extract([row]).run.first

    expect(basket.model_name).to eq('basket')
    expect(basket.attributes['submitted_at']).to eq('2024-06-03 12:45:21 +0200')
    expect(basket.attributes['phase_ref']).to be(phase.attributes)
    expect(basket.attributes['user_ref']).to be(user.attributes)

    bi1 = ref_map.fetch('decidim--budgets--order--1-decidim--budgets--project--1')
    expect(bi1.model_name).to eq('baskets_idea')
    expect(bi1.attributes['votes']).to eq(30_000)
    expect(bi1.attributes['basket_ref']).to be(basket.attributes)
    expect(bi1.attributes['idea_ref']).to be(idea1.attributes)
    expect(ref_map.fetch('decidim--budgets--order--1-decidim--budgets--project--7').attributes['votes']).to eq(15_000)
  end

  it 'keeps a pending order (blank checkout) as an unsubmitted basket' do
    basket = extract([row('checked_out_at' => '')]).run.first
    expect(basket.attributes['submitted_at']).to be_nil
  end

  it 'keeps an order by a non-imported user, user-less' do
    basket = extract([row('user' => 'decidim--user--999')]).run.first
    expect(basket.attributes).not_to have_key('user_ref')
  end

  it 'drops picks that are not imported ideas or carry no budget' do
    ref_map.register('decidim--budgets--project--0', DecidimImporter::Record.new('idea', {})) # no budget
    extract([row('projects' => '["decidim--budgets--project--0","decidim--budgets--project--1","nope"]')]).run

    expect(ref_map.fetch('decidim--budgets--order--1-decidim--budgets--project--0')).to be_nil # no budget
    expect(ref_map.fetch('decidim--budgets--order--1-nope')).to be_nil # not an idea
    expect(ref_map.fetch('decidim--budgets--order--1-decidim--budgets--project--1')).to be_present
  end

  it 'skips a duplicate (user, phase) order' do
    extractor = extract([row, row('uid' => 'decidim--budgets--order--2')])
    expect(extractor.run.size).to eq(1)
    expect(extractor.skipped.first).to include(uid: 'decidim--budgets--order--2', reason: 'duplicate basket')
  end

  it 'skips an order whose voting phase was not imported' do
    extractor = extract([row('decidim_component' => 'decidim--component--999')])
    expect(extractor.run).to be_empty
    expect(extractor.skipped.first[:reason]).to eq('no phase for order')
  end
end
