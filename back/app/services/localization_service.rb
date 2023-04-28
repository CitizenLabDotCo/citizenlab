# frozen_string_literal: true

class LocalizationService
  # @param [Integer] hour, 0-23
  # @return [String] either 12 or 24-hour format representation, depending on locale
  def hour_of_day_string(hour, locale)
    return "#{hour}:00" unless %w[en en-GB en-US en-CA].include?(locale) # e.g. "13:00"

    hour > 12 ? "#{hour % 12} PM" : "#{hour} AM" # e.g. "1 PM"
  end
end
