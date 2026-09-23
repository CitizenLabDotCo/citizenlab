# frozen_string_literal: true

class WebApi::V1::StatsController < ApplicationController
  before_action :do_authorize, :parse_time_boundaries
  skip_before_action :authenticate_user

  @@stats_service = StatsService.new

  private

  def parse_time_boundaries
    @start_at, @end_at, @no_data = TimeBoundaries.parse(params[:start_at], params[:end_at])
  end

  def apply_exclude_admins_and_moderators_filter(records, user_column)
    return records unless StatisticsRoleExclusion.exclude_admins_and_moderators?

    StatisticsRoleExclusion.exclude_admin_and_moderator_records(records, user_column)
  end
end
