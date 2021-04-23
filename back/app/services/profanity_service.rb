class ProfanityService
  def search_blocked_words text
    AppConfiguration.instance.settings.dig('core', 'locales').map do |locale|
      locale.split('-').first
    end.uniq.flat_map do |lang|
      regex = Rails.cache.fetch("#{lang}/blocked_words", expires_in: 1.hour) do
        blocked_words = open(Rails.root.join("config/blocked_words/#{lang}.txt")).readlines
        blocked_words = blocked_words.map(&:strip).map(&:downcase)
        /(#{blocked_words.map{|word| Regexp.escape(word)}.join('|')})/
      end
      text.enum_for(:scan, regex).map do |word| 
        { 
          word: word,
          position: Regexp.last_match.begin(0),
          language: lang
        }
      end
    end
  end
end