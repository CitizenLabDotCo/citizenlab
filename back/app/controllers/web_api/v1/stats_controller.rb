# frozen_string_literal: true

class WebApi::V1::StatsController < ApplicationController
  before_action :do_authorize, :parse_time_boundaries
  skip_before_action :authenticate_user

  @@stats_service = StatsService.new

  private

  def range_intersection(r1, r2)
    ([r1.begin, r2.begin].max)..([r1.end, r2.end].min)
  end

  def parse_time_boundaries
    platform_range = AppConfiguration.instance.created_at..AppConfiguration.timezone.now.end_of_day
    start_range = params[:start_at]&.to_date ? params[:start_at] : platform_range.begin
    end_range = params[:end_at]&.to_date ? params[:end_at] : platform_range.end
    requested_range = start_range...end_range
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
end
