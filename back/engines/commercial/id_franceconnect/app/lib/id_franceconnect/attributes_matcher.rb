# frozen_string_literal: true

class IdFranceconnect::AttributesMatcher
  extend Gem::Text

  MAXIMUM_NUMBER_OF_LETTERS_FOR_EXACT_MATCH = 3

  class << self
    def match?(string1, string2)
      words1 = TextUtils.normalize(string1).split(/\s+/)
      words2 = TextUtils.normalize(string2).split(/\s+/)

      words1.any? do |word1|
        words2.any? { |word2| words_match?(word1, word2) }
      end
    end

    private

    def words_match?(word1, word2)
      return false if word1.blank? || word2.blank?

      max = MAXIMUM_NUMBER_OF_LETTERS_FOR_EXACT_MATCH
      if word1.length <= max && word2.length <= max
        word1 == word2
      else
        levenshtein_distance(word1, word2) <= 1
      end
    end
  end
end
