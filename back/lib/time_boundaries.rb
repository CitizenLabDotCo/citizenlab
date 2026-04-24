module TimeBoundaries
  DATE_REGEX = /\A\d{4}-\d{2}-\d{2}\z/

  module_function

  # Parses from/to boundaries into timestamps clamped to the platform's lifetime.
  #
  # Date inputs (Date or "YYYY-MM-DD") are expanded to cover the full day:
  # +from+ becomes the beginning of the day and +to+ becomes the start of the next day
  # (exclusive end). Time inputs are used as-is.
  #
  # Returns [start_time, end_time, no_data] where no_data is true if the
  # range doesn't overlap with the platform's lifetime.
  def parse(from, to)
    range = parse_range(from, to)
    platform_range = AppConfiguration.instance.platform_start_at..Time.zone.tomorrow.beginning_of_day

    if range.overlaps?(platform_range)
      clamped = clamp(range, platform_range)
      [clamped.begin, clamped.end, false]
    else
      [Time.now, Time.now, true]
    end
  end

  def parse_range(from, to)
    from = strict_date?(from) ? from.in_time_zone.beginning_of_day : from&.in_time_zone
    to = strict_date?(to) ? to.in_time_zone.tomorrow.beginning_of_day : to&.in_time_zone

    from..to
  end

  private_class_method def strict_date?(value)
    value.is_a?(Date) || (value.is_a?(String) && DATE_REGEX.match?(value))
  end

  private_class_method def clamp(range, bounds)
    ([range.begin, bounds.begin].compact.max)..([range.end, bounds.end].compact.min)
  end
end
