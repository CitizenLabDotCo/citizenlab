# frozen_string_literal: true

class WebApi::V1::StatsUsersController < WebApi::V1::StatsController
  def users_count
    count = User.active
      .where(registration_completed_at: @start_at..@end_at)
      .active
      .count

    render json: raw_json({
      count: count,
      administrators_count: User.billed_admins.count,
      folder_moderators_count: User.project_folder_moderator.not_citizenlab_member.count,
      project_moderators_count: User.project_moderator.not_citizenlab_member.count
    })
  end

  private

  def do_authorize
    authorize :stat_user
  end
end
