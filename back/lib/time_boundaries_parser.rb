class TimeBoundariesParser
  DATE_REGEX = /\A\d{4}-\d{2}-\d{2}\z/

  def initialize(start_at, end_at)
    @start_at = start_at
    @end_at = end_at
  end

  def parse
    range = _parse
    platform_range = AppConfiguration.instance.platform_start_at..Time.zone.now.end_of_day

    if range.overlaps?(platform_range)
      clamped = range_intersection(range, platform_range)
      [clamped.begin, clamped.end, false]
    else
      [Time.now, Time.now, true]
    end
  end

  def _parse
    start_at = if @start_at.is_a?(String) && DATE_REGEX.match?(@start_at)
      Time.zone.parse(@start_at).beginning_of_day
    else
      @start_at&.in_time_zone
    end

    end_at = if @end_at.is_a?(String) && DATE_REGEX.match?(@end_at)
      Time.zone.parse(@end_at).end_of_day
    else
      @end_at&.in_time_zone
    end

    start_at..end_at
  end

  private

  def range_intersection(r1, r2)
    ([r1.begin, r2.begin].compact.max)..([r1.end, r2.end].compact.min)
  end
end
