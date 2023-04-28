# frozen_string_literal: true

class LocalizationService
  # @param [Integer] hour, 0-23
  # @return [String] either 12 or 24-hour localized representation, depending on locale
  def hour_of_day_string(hour, locale)
    case locale
    when 'en', 'en-GB', 'en-US', 'en-CA'
      hour > 12 ? "#{hour % 12} PM" : "#{hour} AM" # e.g. "1 PM"
    when 'hr-HR' # Croatian
      hour > 12 ? "#{hour % 12}:00 sati" : "0#{hour}:00 sata" # e.g. "01:00 sata"
    else
      hour > 12 ? "#{hour}:00" : "0#{hour}:00" # e.g. "13:00"
    end
  end
end
