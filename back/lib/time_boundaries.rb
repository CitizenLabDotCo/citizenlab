module TimeBoundaries
  DATE_REGEX = /\A\d{4}-\d{2}-\d{2}\z/

  module_function

  def parse(from, to)
    range = parse_range(from, to)
    platform_range = AppConfiguration.instance.platform_start_at..Time.zone.now.end_of_day

    if range.overlaps?(platform_range)
      clamped = clamp(range, platform_range)
      [clamped.begin, clamped.end, false]
    else
      [Time.now, Time.now, true]
    end
  end

  def parse_range(from, to)
    from = if from.is_a?(String) && DATE_REGEX.match?(from)
      Time.zone.parse(from).beginning_of_day
    else
      from&.in_time_zone
    end

    to = if to.is_a?(String) && DATE_REGEX.match?(to)
      Time.zone.parse(to).end_of_day
    else
      to&.in_time_zone
    end

    from..to
  end

  def clamp(range, bounds)
    ([range.begin, bounds.begin].compact.max)..([range.end, bounds.end].compact.min)
  end
end
