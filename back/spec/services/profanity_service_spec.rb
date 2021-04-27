require "rails_helper"

describe ProfanityService do
  let(:service) { ProfanityService.new }

  describe "search_blocked_words" do
    before { Rails.cache.clear } # for some reason, caching is enabled while testing
    before { stub_fetch_blocked_words! service }

    it "matches exact occurences" do
      text = 'Ik vind hem een beetje een zeveraar.'
      expect(service.search_blocked_words(text)).to match_array([{
        word: 'zeveraar',
        position: 27,
        language: 'nl'
      }])
    end

    it "returns no matches when there are no occurences" do
      text = 'Ik vind hem een beetje een gluiperd.'
      expect(service.search_blocked_words(text)).to be_blank
    end

    it "returns matches for multilple languages" do
      text = 'His recipe for chili con carne is the stupidest.'
      expect(service.search_blocked_words(text)).to match_array([
        {
          word: 'con',
          position: 21,
          language: 'fr'
        },
        {
          word: 'stupid',
          position: 38,
          language: 'en'
        },
      ])
    end

    it "matches case-insensitively" do
      text = 'Il est un peu déBiLE.'
      expect(service.search_blocked_words(text)).to match_array([{
        word: 'débile',
        position: 14,
        language: 'fr'
      }])
    end

    it "doesn't match on accents or digits" do
      text = 'Il est un peu debile et id1ot.'
      expect(service.search_blocked_words(text)).to be_blank
    end
  end

  private

  def stub_fetch_blocked_words! service
    service.stub(:fetch_blocked_words) do |lang|
      case lang
      when 'fr'
        [
          'con',
          'débile',
          'idiot'
        ]
      when 'nl'
        [
          'ambetanterik',
          'debiel',
          'zeveraar'
        ]
      else
        [
          'idiot',
          'stupid'
        ]
      end
    end
  end

end
