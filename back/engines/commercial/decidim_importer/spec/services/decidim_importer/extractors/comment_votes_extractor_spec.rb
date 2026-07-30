# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DecidimImporter::Extractors::CommentVotesExtractor do
  let(:ref_map) { DecidimImporter::RefMap.new }
  let(:mapper) { DecidimImporter::LocaleMapper.new }
  let(:comment) { DecidimImporter::Record.new('comment', { 'body_multiloc' => { 'fr-FR' => 'C' } }) }
  let(:user) { DecidimImporter::Record.new('user', { 'email' => 'a@b.c' }) }

  before do
    ref_map.register('decidim--comments--comment--37', comment)
    ref_map.register('decidim--user--818', user)
  end

  def extract(rows)
    described_class.new(rows, ref_map, locale_mapper: mapper, primary_locale: 'fr-FR')
  end

  def row(overrides = {})
    {
      'uid' => 'decidim--comments--comment-vote--1', 'comment' => 'decidim--comments--comment--37',
      'author' => 'decidim--user--818', 'value' => 'up',
      'created_at' => '2024-01-22 12:34:48 +0100', 'updated_at' => '2024-01-22 12:34:48 +0100'
    }.merge(overrides)
  end

  it 'builds an up-Reaction on the comment by the author, carrying the source dates' do
    reaction = extract([row]).run.first

    expect(reaction.model_name).to eq('reaction')
    expect(reaction.attributes['mode']).to eq('up')
    expect(reaction.attributes['reactable_ref']).to be(comment.attributes)
    expect(reaction.attributes['user_ref']).to be(user.attributes)
    expect(reaction.attributes['created_at']).to eq('2024-01-22 12:34:48 +0100')
    expect(ref_map.fetch('decidim--comments--comment-vote--1')).to eq(reaction)
  end

  it 'maps a down vote to a down-Reaction (dislike)' do
    reaction = extract([row('value' => 'down')]).run.first
    expect(reaction.attributes['mode']).to eq('down')
  end

  it 'keeps a vote whose author was not imported, author-less (preserving the count)' do
    reaction = extract([row('author' => 'decidim--user--999')]).run.first

    expect(reaction.attributes).not_to have_key('user_ref')
    expect(reaction.attributes['mode']).to eq('up')
    expect(reaction.attributes['reactable_ref']).to be(comment.attributes)
  end

  it 'skips a vote on a comment that was not imported' do
    extractor = extract([row('comment' => 'decidim--comments--comment--999')])
    expect(extractor.run).to be_empty
    expect(extractor.skipped.first).to include(uid: 'decidim--comments--comment-vote--1', reason: 'voted comment not imported')
  end

  it 'skips a vote with an unknown value' do
    extractor = extract([row('value' => 'sideways')])
    expect(extractor.run).to be_empty
    expect(extractor.skipped.first[:reason]).to include('unknown vote value')
  end

  it 'skips a duplicate (user, comment, mode) vote but allows the opposite mode' do
    extractor = extract([
      row,
      row('uid' => 'vote-2'), # same user + comment + mode → duplicate
      row('uid' => 'vote-3', 'value' => 'down') # same user + comment, other mode → kept
    ])
    expect(extractor.run.size).to eq(2)
    expect(extractor.skipped.first).to include(uid: 'vote-2', reason: 'duplicate comment vote')
  end
end
