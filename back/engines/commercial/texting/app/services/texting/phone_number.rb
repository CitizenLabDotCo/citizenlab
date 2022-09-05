# frozen_string_literal: true

class Texting::PhoneNumber
  MIN_LENGTH = 7 # pretty random
  MAX_LENGTH = 15 # https://en.wikipedia.org/wiki/E.164

  class << self
    # I tried to use phonelib and telephone_number gems, but they're super slow (1000 numbers per second).
    # Current implementation is ~100x faster.
    # If conditions change, the error message in
    # front/app/containers/Admin/messaging/texting/components/SMSCampaignForm.tsx may need to be updated.
    def valid?(number, country_codes: [])
      codes_regex =
        if country_codes.present?
          "(#{country_codes.map { |code| Regexp.escape(code) }.join('|')})"
        else
          '\+?'
        end
      normalize(number).match?(/\A#{codes_regex}\d{#{MIN_LENGTH},#{MAX_LENGTH}}\Z/)
    end

    def normalize(number)
      number.gsub(/[-\s()]/, '')
    end

    def requirements(country_codes: [])
      { min_length: MIN_LENGTH, max_length: MAX_LENGTH, valid_country_codes: country_codes }
    end
  end
end
