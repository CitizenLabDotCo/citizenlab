class Texting::PhoneNumber
  class << self
    # I tried to use phonelib and telephone_number gems, but they're super slow (1000 numbers per second).
    # Current implementation is ~100x faster.
    def valid?(number, country_codes = [])
      min_length = 7 # pretty random
      max_length = 15 # https://en.wikipedia.org/wiki/E.164
      codes_regex =
        if country_codes.present?
          "(#{country_codes.map { |code| Regexp.escape(code) }.join('|')})"
        else
          '\+'
        end
      number.match?(/\A#{codes_regex}\d{#{min_length},#{max_length}}\Z/)
    end
  end
end
