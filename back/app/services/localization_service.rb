# frozen_string_literal: true

# Custom localization formats, separated into this file mainly to make testing easier.
class LocalizationService
  # @param [Time] time object with hour of day specified. e.g. Time.new(-2000, 1, 1, 18, 0, 0), where 18 is the hour.
  # @return [String] localized hour of day in display format. e.g. '6pm' or '18:00' or '18h'.
  def hour_of_day(time_obj)
    (I18n.l time_obj, format: :hour_of_day).lstrip
  end
end
