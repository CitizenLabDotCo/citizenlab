# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DecidimImporter::Extractors::EndorsementsExtractor do
  let(:ref_map) { DecidimImporter::RefMap.new }
  let(:mapper) { DecidimImporter::LocaleMapper.new }
  let(:idea) { DecidimImporter::Record.new('idea', { 'title_multiloc' => { 'fr-FR' => 'I' } }) }
  let(:user) { DecidimImporter::Record.new('user', { 'email' => 'a@b.c' }) }

  before do
    ref_map.register('decidim--proposals--proposal--194', idea)
    ref_map.register('decidim--user--807', user)
  end

  def extract(rows)
    described_class.new(rows, ref_map, locale_mapper: mapper, primary_locale: 'fr-FR')
  end

  def row(overrides = {})
    {
      'uid' => 'decidim--endorsement--58', 'author' => 'decidim--user--807',
      'endorsement_for' => 'decidim--proposals--proposal--194',
      'created_at' => '2023-12-10 08:50:48 +0100', 'updated_at' => '2025-06-24 11:37:45 +0200'
    }.merge(overrides)
  end

  it 'builds an up-Reaction on the idea by the author, carrying the source dates' do
    reaction = extract([row]).run.first

    expect(reaction.model_name).to eq('reaction')
    expect(reaction.attributes['mode']).to eq('up')
    expect(reaction.attributes['reactable_ref']).to be(idea.attributes)
    expect(reaction.attributes['user_ref']).to be(user.attributes)
    expect(reaction.attributes['created_at']).to eq('2023-12-10 08:50:48 +0100')
    expect(ref_map.fetch('decidim--endorsement--58')).to eq(reaction)
  end

  it 'keeps an endorsement whose author was not imported, author-less (preserving the like)' do
    reaction = extract([row('author' => 'decidim--user--999')]).run.first

    expect(reaction.attributes).not_to have_key('user_ref')
    expect(reaction.attributes['mode']).to eq('up')
    expect(reaction.attributes['reactable_ref']).to be(idea.attributes)
  end

  it 'skips an endorsement of a proposal that was not imported' do
    extractor = extract([row('endorsement_for' => 'decidim--proposals--proposal--999')])
    expect(extractor.run).to be_empty
    expect(extractor.skipped.first).to include(uid: 'decidim--endorsement--58', reason: 'endorsed proposal not imported')
  end

  it 'skips a duplicate (user, idea) endorsement' do
    extractor = extract([row, row('uid' => 'decidim--endorsement--59')])
    expect(extractor.run.size).to eq(1)
    expect(extractor.skipped.first).to include(uid: 'decidim--endorsement--59', reason: 'duplicate endorsement')
  end
end
