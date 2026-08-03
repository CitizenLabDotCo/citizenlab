# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DecidimImporter::Extractors::ProposalNotesExtractor do
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
      'uid' => 'decidim-note-1', 'proposal' => 'decidim-proposal-1', 'author' => 'decidim-user-1',
      'body' => 'Needs legal review.', 'created_at' => '2023-02-13 09:00:00 +0100',
      'updated_at' => '2023-02-14 09:00:00 +0100'
    }.merge(overrides)
  end

  it 'builds a published internal comment on the noted proposal’s idea, with its author' do
    attrs = extract([row]).first.attributes

    expect(attrs['body']).to eq('Needs legal review.') # plain text, not a multiloc
    expect(attrs['publication_status']).to eq('published')
    expect(attrs['created_at']).to eq('2023-02-13 09:00:00 +0100')
    expect(attrs['updated_at']).to eq('2023-02-14 09:00:00 +0100')
    expect(attrs['idea_ref']).to be(idea.attributes)
    expect(attrs['author_ref']).to be(ref_map.fetch('decidim-user-1').attributes)
  end

  it 'registers the note under its uid' do
    expect(extract([row]).first.key).to eq('decidim-note-1')
    expect(ref_map.fetch('decidim-note-1')).to be_present
  end

  it 'imports a note whose author was filtered out as author-less' do
    attrs = extract([row('author' => 'decidim-user-999')]).first.attributes
    expect(attrs).not_to have_key('author_ref')
  end

  it 'skips a note whose noted proposal was not imported, and blank bodies' do
    extractor = described_class.new(
      [row('uid' => 'decidim-note-9', 'proposal' => 'missing'),
        row('uid' => 'decidim-note-8', 'body' => ''),
        row('uid' => 'decidim-note-7', 'body' => '  ')],
      ref_map, locale_mapper: mapper, primary_locale: 'fr-FR'
    )
    expect(extractor.run).to be_empty
    expect(extractor.skipped.map { |s| s[:uid] })
      .to contain_exactly('decidim-note-9', 'decidim-note-8', 'decidim-note-7')
  end
end
