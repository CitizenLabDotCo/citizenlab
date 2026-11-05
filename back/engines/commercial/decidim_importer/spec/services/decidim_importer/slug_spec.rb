# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DecidimImporter::Slug do
  describe '.sanitize' do
    it 'passes an already-valid slug through unchanged' do
      expect(described_class.sanitize('bp2019')).to eq('bp2019')
    end

    it 'collapses double hyphens and downcases so Sluggable accepts it' do
      slug = described_class.sanitize('Assemblee--Citoyenne')
      expect(slug).to eq('assemblee-citoyenne')
      expect(slug).to match(Sluggable::SLUG_REGEX)
    end

    it 'transliterates accents' do
      expect(described_class.sanitize('Cadre de vie été')).to eq('cadre-de-vie-ete')
    end

    it 'returns nil when nothing slug-worthy remains' do
      expect(described_class.sanitize('---')).to be_nil
      expect(described_class.sanitize('')).to be_nil
      expect(described_class.sanitize(nil)).to be_nil
    end
  end
end
