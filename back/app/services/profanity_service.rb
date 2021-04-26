class ProfanityService
  def search_blocked_words text
    AppConfiguration.instance.settings.dig('core', 'locales').map do |locale|
      locale.split('-').first
    end.uniq.flat_map do |lang|
      regex = Rails.cache.fetch("#{lang}/blocked_words", expires_in: 1.hour) do
        blocked_words = fetch_blocked_words(lang).map{|w| normalize_text w}
        /(#{blocked_words.map{|word| Regexp.escape(word)}.join('|')})/
      end
      normalize_text(text).enum_for(:scan, regex).map(&:join).map do |word| 
        { 
          word: word,
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
    text.downcase
  end

  def fetch_blocked_words lang
    open(Rails.root.join("config/blocked_words/#{lang}.txt")).readlines.map(&:strip)
  end
end