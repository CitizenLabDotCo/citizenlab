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
    role_exclusion = StatisticsRoleExclusion.new
    return records unless role_exclusion.exclude_admins_and_moderators?

    role_exclusion.exclude_admin_and_moderator_records(records, user_column)
  end

  # Adds the counts of child topics to their parents.
  def add_child_counts_to_parents(counts_by_topic_id)
    return counts_by_topic_id if counts_by_topic_id.blank?

    InputTopic.where(id: counts_by_topic_id.keys, depth: 1).each do |child|
      counts_by_topic_id[child.parent_id] = (counts_by_topic_id[child.parent_id] || 0) + counts_by_topic_id[child.id]
    end

    counts_by_topic_id
  end
end
