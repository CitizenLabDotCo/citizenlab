class TimeBoundariesParser
  def initialize(start_at, end_at)
    @start_at = start_at
    @end_at = end_at
  end

  def parse
    platform_range = AppConfiguration.instance.created_at..AppConfiguration.timezone.now.end_of_day
    start_range = @start_at.present? ? @start_at.to_date : platform_range.begin
    end_range = @end_at.present? ? @end_at.to_date : platform_range.end
    requested_range = start_range...end_range
    if requested_range.overlaps?(platform_range)
      range = range_intersection(platform_range, requested_range)
      no_data = false
      [range.begin, range.end, no_data]
    else
      no_data = true
      [Time.now, Time.now, no_data]
    end
  end

  private

  def range_intersection(r1, r2)
    ([r1.begin, r2.begin].max)..([r1.end, r2.end].min)
  end
end
