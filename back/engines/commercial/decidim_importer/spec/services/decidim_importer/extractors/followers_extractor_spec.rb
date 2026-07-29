# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DecidimImporter::Extractors::FollowersExtractor do
  let(:ref_map) { DecidimImporter::RefMap.new }
  let(:mapper) { DecidimImporter::LocaleMapper.new }
  let(:idea) { DecidimImporter::Record.new('idea', { 'title_multiloc' => { 'fr-FR' => 'I' } }) }
  let(:user) { DecidimImporter::Record.new('user', { 'email' => 'a@b.c' }) }

  before do
    ref_map.register('decidim--proposals--proposal--24', idea)
    ref_map.register('decidim--user--131', user)
  end

  def extract(rows)
    described_class.new(rows, ref_map, locale_mapper: mapper, primary_locale: 'fr-FR')
  end

  def row(overrides = {})
    {
      'uid' => 'decidim--follow--348', 'user' => 'decidim--user--131',
      'followable' => 'decidim--proposals--proposal--24',
      'created_at' => '2023-03-11 10:18:17 +0100', 'updated_at' => '2023-03-11 10:18:17 +0100'
    }.merge(overrides)
  end

  it 'builds a Follower on the idea by the user, carrying the source dates' do
    follower = extract([row]).run.first

    expect(follower.model_name).to eq('follower')
    expect(follower.attributes['followable_ref']).to be(idea.attributes)
    expect(follower.attributes['user_ref']).to be(user.attributes)
    expect(follower.attributes['created_at']).to eq('2023-03-11 10:18:17 +0100')
    expect(ref_map.fetch('decidim--follow--348')).to eq(follower)
  end

  it 'skips a follow of a proposal that was not imported (e.g. a collaborative draft)' do
    extractor = extract([row('followable' => 'decidim--proposals--collaborative-draft--1')])
    expect(extractor.run).to be_empty
    expect(extractor.skipped.first).to include(uid: 'decidim--follow--348', reason: 'followed proposal not imported')
  end

  it 'skips a follow whose user was not imported (a Follower requires a user)' do
    extractor = extract([row('user' => 'decidim--user--999')])
    expect(extractor.run).to be_empty
    expect(extractor.skipped.first).to include(uid: 'decidim--follow--348', reason: 'follower user not imported')
  end

  it 'skips a duplicate (user, idea) follow' do
    extractor = extract([row, row('uid' => 'decidim--follow--349')])
    expect(extractor.run.size).to eq(1)
    expect(extractor.skipped.first).to include(uid: 'decidim--follow--349', reason: 'duplicate follow')
  end
end
