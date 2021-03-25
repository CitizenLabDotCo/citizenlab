class WebApi::V1::StatsController < ApplicationController

  before_action :do_authorize, :parse_time_boundaries

  @@stats_service = StatsService.new

  private

  def range_intersection r1, r2
    ([r1.begin, r2.begin].max)..([r1.end, r2.end].min)
  end

  def parse_time_boundaries
    platform_range = AppConfiguration.instance.created_at..Time.now
    requested_range = (params[:start_at] || platform_range.begin)..(params[:end_at] || platform_range.end)
    if requested_range.overlaps?(platform_range)
      range = range_intersection(platform_range, requested_range)
      @start_at = range.begin
      @end_at = range.end
    else
      @no_data = true
      @start_at = Time.now
      @end_at = Time.now
    end
  end

  def secure_controller?
    false
  end

end
