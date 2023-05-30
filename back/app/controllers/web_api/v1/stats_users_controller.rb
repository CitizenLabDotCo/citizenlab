# frozen_string_literal: true

class WebApi::V1::StatsUsersController < WebApi::V1::StatsController
  @@multiloc_service = MultilocService.new

  before_action :render_no_data, only: %i[
    users_by_time
    users_by_time_cumulative
    active_users_by_time
    active_users_by_time_cumulative
  ]
  before_action :render_no_data_as_xlsx, only: %i[
    users_by_time_as_xlsx
    users_by_time_cumulative_as_xlsx
    active_users_by_time_as_xlsx
  ]

  def users_count
    count = User.active
      .where(registration_completed_at: @start_at..@end_at)
      .active
      .count

    render json: raw_json({
      count: count,
      administrators_count: User.billed_admins.count,
      moderators_count: User.billed_moderators.count
    })
  end

  def users_by_time_serie
    users_scope = StatUserPolicy::Scope.new(current_user, User.active).resolve

    if params[:project]
      project = Project.find(params[:project])
      users_scope = ProjectPolicy::InverseScope.new(project, users_scope).resolve
    end

    if params[:group]
      group = Group.find(params[:group])
      users_scope = users_scope.merge(group.members)
    end

    if params[:topic]
      users_scope = @@stats_service.filter_users_by_topic(users_scope, params[:topic])
    end

    @@stats_service.group_by_time(
      users_scope,
      'registration_completed_at',
      @start_at,
      @end_at,
      params[:interval]
    )
  end

  def users_by_time
    render json: { series: { users: users_by_time_serie } }
  end

  def users_by_time_as_xlsx
    xlsx = XlsxService.new.generate_time_stats_xlsx users_by_time_serie, 'users_by_time'
    send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'users_by_time.xlsx'
  end

  def users_by_time_cumulative_serie
    users_scope = StatUserPolicy::Scope.new(current_user, User.active).resolve

    if params[:project]
      project = Project.find(params[:project])
      users_scope = ProjectPolicy::InverseScope.new(project, users_scope).resolve
    end

    if params[:group]
      group = Group.find(params[:group])
      users_scope = users_scope.merge(group.members)
    end

    if params[:topic]
      users_scope = @@stats_service.filter_users_by_topic(users_scope, params[:topic])
    end

    @@stats_service.group_by_time_cumulative(
      users_scope,
      'registration_completed_at',
      @start_at,
      @end_at,
      params[:interval]
    )
  end

  def users_by_time_cumulative
    render json: { series: { users: users_by_time_cumulative_serie } }
  end

  def users_by_time_cumulative_as_xlsx
    xlsx = XlsxService.new.generate_time_stats_xlsx users_by_time_cumulative_serie, 'users_by_time_cumulative'

    send_data(
      xlsx,
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      filename: 'users_by_time_cumulative.xlsx'
    )
  end

  def active_users_by_time_cumulative_serie
    activities_scope = Activity
      .select(:user_id).distinct
      .where(user_id: StatUserPolicy::Scope.new(current_user, User.active).resolve)

    ps = ParticipantsService.new
    activities_scope = ps.filter_engaging_activities(activities_scope)

    if params[:project]
      project = Project.find(params[:project])
      participants = ps.project_participants(project)
      activities_scope = activities_scope.where(user_id: participants)
    end

    if params[:group]
      group = Group.find(params[:group])
      activities_scope = activities_scope.where(user_id: group.members)
    end

    if params[:topic]
      users_scope = @@stats_service.filter_users_by_topic(User, params[:topic])
      activities_scope = activities_scope.where(user_id: users_scope)
    end

    @@stats_service.group_by_time_cumulative(
      activities_scope,
      'acted_at',
      @start_at,
      @end_at,
      params[:interval]
    )
  end

  def active_users_by_time_cumulative
    render json: { series: { users: active_users_by_time_cumulative_serie } }
  end

  def active_users_by_time_serie
    activities_scope = Activity
      .select(:user_id).distinct
      .where(user_id: StatUserPolicy::Scope.new(current_user, User.active).resolve)

    ps = ParticipantsService.new
    activities_scope = ps.filter_engaging_activities(activities_scope)

    if params[:project]
      project = Project.find(params[:project])
      participants = ps.project_participants(project)
      activities_scope = activities_scope.where(user_id: participants)
    end

    if params[:group]
      group = Group.find(params[:group])
      activities_scope = activities_scope.where(user_id: group.members)
    end

    if params[:topic]
      users_scope = @@stats_service.filter_users_by_topic(User, params[:topic])
      activities_scope = activities_scope.where(user_id: users_scope)
    end

    @@stats_service.group_by_time(
      activities_scope,
      'acted_at',
      @start_at,
      @end_at,
      params[:interval]
    )
  end

  def active_users_by_time
    render json: { series: { users: active_users_by_time_serie } }
  end

  def active_users_by_time_as_xlsx
    xlsx = XlsxService.new.generate_time_stats_xlsx active_users_by_time_serie, 'active_users_by_time'
    send_data(
      xlsx,
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      filename: 'active_users_by_time.xlsx'
    )
  end

  private

  def render_no_data
    return unless @no_data

    render json: { series: { users: {} } }
  end

  def render_no_data_as_xlsx
    return unless @no_data

    render json: { errors: 'no data for this period' }, status: :unprocessable_entity
  end

  def do_authorize
    authorize :stat_user
  end
end
