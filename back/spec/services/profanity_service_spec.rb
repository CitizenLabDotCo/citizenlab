# frozen_string_literal: true

require 'rails_helper'

describe ProfanityService do
  let(:service) { described_class.new }

  describe 'search_blocked_words' do
    # for some reason, caching is enabled while testing
    before do
      Rails.cache.clear
      stub_fetch_blocked_words! service
    end

    after { Rails.cache.clear }

    it 'matches exact occurences' do
      text = 'Ik vind hem een beetje een zeveraar.'
      expect(service.search_blocked_words(text)).to contain_exactly({
        word: 'zeveraar',
        # position: 27,
        language: 'nl'
      })
    end

    it 'returns no matches when there are no occurences' do
      text = 'Ik vind hem een beetje een gluiperd.'
      expect(service.search_blocked_words(text)).to be_blank
    end

    # Keeping this when we would go back to regex solution
    # it "matches multiple occurrences of the same blocked word" do
    #   text = 'You stupid stupido.'
    #   expect(service.search_blocked_words(text)).to match_array([
    #     {
    #       word: 'stupid',
    #       position: 4,
    #       language: 'en'
    #     },
    #     {
    #       word: 'stupid',
    #       position: 11,
    #       language: 'en'
    #     }
    #   ])
    # end

    # Keeping this when we would go back to regex solution
    # it "returns matches for multilple languages" do
    #   text = 'His recipe for chili con carne is the stupidest.'
    #   expect(service.search_blocked_words(text)).to match_array([
    #     {
    #       word: 'con',
    #       position: 21,
    #       language: 'fr'
    #     },
    #     {
    #       word: 'stupid',
    #       position: 38,
    #       language: 'en'
    #     },
    #   ])
    # end

    it 'returns matches for multilple languages' do
      text = 'His recipe for chili con carne is so stupid.'
      expect(service.search_blocked_words(text)).to contain_exactly({
        word: 'con',
        language: 'fr'
      }, {
        word: 'stupid',
        language: 'en'
      })
    end

    it 'matches case-insensitively' do
      text = 'Il est un peu déBiLE.'
      expect(service.search_blocked_words(text)).to contain_exactly({
        word: 'débile',
        language: 'fr'
      })
    end

    it "doesn't match on accents or digits" do
      text = 'Il est un peu debile et id1ot.'
      expect(service.search_blocked_words(text)).to be_blank
    end

    it 'matches with HTML' do
      text = '<p>Je suis tombé dans une pute</p>'
      expect(service.search_blocked_words(text)).to contain_exactly({
        word: 'pute',
        language: 'fr'
      })
    end
  end

  describe 'blocked words list' do
    I18n.available_locales.map do |locale|
      locale.to_s.split('-').first
    end.uniq.each do |lang|
      it "exists for #{lang}" do
        expect(Rails.root.join("config/blocked_words/#{lang}.txt").exist?).to be true
      end

      it "has no entries with spaces for #{lang}" do
        words = Rails.root.join("config/blocked_words/#{lang}.txt").readlines.map(&:strip)
        words.each do |word|
          expect(word).not_to include ' '
        end
      end
    end
  end

  private

  def stub_fetch_blocked_words!(service)
    service.stub(:fetch_blocked_words) do |lang|
      case lang
      when 'fr'
        %w[
          con
          débile
          idiot
          pute
        ]
      when 'nl'
        %w[
          ambetanterik
          debiel
          zeveraar
        ]
      else
        %w[
          idiot
          stupid
        ]
      end
    end
  end
end
