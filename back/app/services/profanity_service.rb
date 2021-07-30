class ProfanityService

  IGNORE_SPECIAL_CHARS = '.?¿!,:;\'"(){}[]#@_'


  def search_blocked_words text
    AppConfiguration.instance.settings.dig('core', 'locales').map do |locale|
      locale.split('-').first
    end.uniq.flat_map do |lang|
      blocked_words = Rails.cache.fetch("#{lang}/blocked_words_set", expires_in: 1.hour) do
        Set.new(fetch_blocked_words(lang).map{|w| normalize_text w})
      end
      words = without_special_chars(normalize_text(text)).split ' '
      blocked_words.intersection(words).map do |blocked_word|
        {
          word: blocked_word,
          language: lang
        }
      end
    end
  end

  # Keeping this when we would go back to regex solution
  def search_blocked_occurences text
    AppConfiguration.instance.settings.dig('core', 'locales').map do |locale|
      locale.split('-').first
    end.uniq.flat_map do |lang|
      regex = Rails.cache.fetch("#{lang}/blocked_words_regex", expires_in: 1.hour) do
        blocked_words = fetch_blocked_words(lang).map{|w| normalize_text w}
        /(#{blocked_words.map{|word| Regexp.escape(word)}.join('|')})/
      end
      normalize_text(text).enum_for(:scan, regex).map do |match| 
        { 
          word: match.first, # match should only have one element
          position: Regexp.last_match.begin(0),
          language: lang
        }
      end
    end
  end

  private

  def normalize_text text
    # We could also consider removing accents and
    # substituting digits by resembling letters.
    Nokogiri::HTML(text).text.downcase
  end

  def without_special_chars text
    text.tr(IGNORE_SPECIAL_CHARS,'')
  end

  def fetch_blocked_words lang
    open(Rails.root.join("config/blocked_words/#{lang}.txt")).readlines.map(&:strip)
  end
end