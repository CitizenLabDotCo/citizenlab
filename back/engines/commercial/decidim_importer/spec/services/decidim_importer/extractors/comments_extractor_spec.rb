# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DecidimImporter::Extractors::CommentsExtractor do
  let(:ref_map) { DecidimImporter::RefMap.new }
  let(:mapper) { DecidimImporter::LocaleMapper.new }
  let(:idea) { DecidimImporter::Record.new('idea', { 'title_multiloc' => { 'fr-FR' => 'I' } }) }

  before do
    ref_map.register('decidim-proposal-1', idea)
    ref_map.register('decidim-user-1', DecidimImporter::Record.new('user', { 'email' => 'a@b.co' }))
  end

  def extract(rows)
    described_class.new(rows, ref_map, locale_mapper: mapper, primary_locale: 'fr-FR').run
  end

  def row(overrides = {})
    {
      'uid' => 'decidim-comment-1', 'body' => '{"fr":"Bonne idée"}', 'author' => 'decidim-user-1',
      'depth' => '0', 'commentable' => 'decidim-proposal-1', 'root_commentable' => 'decidim-proposal-1',
      'created_at' => '2023-02-11 10:00:00 +0100'
    }.merge(overrides)
  end

  it 'builds a published comment on the idea (via root_commentable) with its author' do
    attrs = extract([row]).first.attributes

    expect(attrs['body_multiloc']).to eq('fr-FR' => 'Bonne idée')
    expect(attrs['publication_status']).to eq('published')
    expect(attrs['idea_ref']).to be(idea.attributes)
    expect(attrs['author_ref']).to be(ref_map.fetch('decidim-user-1').attributes)
    expect(attrs).not_to have_key('parent_ref') # top-level comment
  end

  it 'references the parent comment only for a reply (commentable differs from root)' do
    parent = row
    reply = row(
      'uid' => 'decidim-comment-2', 'depth' => '1',
      'commentable' => 'decidim-comment-1', 'root_commentable' => 'decidim-proposal-1'
    )

    records = extract([reply, parent]) # processed shallow-first regardless of input order
    expect(records.map(&:key)).to eq(%w[decidim-comment-1 decidim-comment-2])
    expect(records.last.attributes['parent_ref']).to be(ref_map.fetch('decidim-comment-1').attributes)
  end

  it 'imports a comment whose author was filtered out as author-less' do
    attrs = extract([row('author' => 'decidim-user-999')]).first.attributes
    expect(attrs).not_to have_key('author_ref')
  end

  it 'skips a comment whose commented-on proposal was not imported, and blank bodies' do
    extractor = described_class.new(
      [row('uid' => 'decidim-comment-9', 'root_commentable' => 'missing'),
        row('uid' => 'decidim-comment-8', 'body' => '')],
      ref_map, locale_mapper: mapper, primary_locale: 'fr-FR'
    )
    expect(extractor.run).to be_empty
    expect(extractor.skipped.map { |s| s[:uid] }).to contain_exactly('decidim-comment-9', 'decidim-comment-8')
  end
end
