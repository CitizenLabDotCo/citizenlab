# frozen_string_literal: true

class WebApi::V1::StatsController < ApplicationController
  before_action :do_authorize, :parse_time_boundaries
  skip_before_action :authenticate_user

  @@stats_service = StatsService.new

  private

  def parse_time_boundaries
    @start_at, @end_at, @no_data = TimeBoundariesParser.new(params[:start_at], params[:end_at]).parse
  end
end
