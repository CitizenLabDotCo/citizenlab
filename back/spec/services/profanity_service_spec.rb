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
        # position: 27,
        language: 'nl'
      }])
    end

    it "returns no matches when there are no occurences" do
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

    it "returns matches for multilple languages" do
      text = 'His recipe for chili con carne is so stupid.'
      expect(service.search_blocked_words(text)).to match_array([
        {
          word: 'con',
          language: 'fr'
        },
        {
          word: 'stupid',
          language: 'en'
        },
      ])
    end

    it "matches case-insensitively" do
      text = 'Il est un peu déBiLE.'
      expect(service.search_blocked_words(text)).to match_array([{
        word: 'débile',
        language: 'fr'
      }])
    end

    it "doesn't match on accents or digits" do
      text = 'Il est un peu debile et id1ot.'
      expect(service.search_blocked_words(text)).to be_blank
    end

    it "matches with HTML" do
      text = '<p>Je suis tombé dans une pute</p>'
      expect(service.search_blocked_words(text)).to match_array([{
        word: 'pute',
        language: 'fr'
      }])
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
          'idiot',
          'pute'
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
