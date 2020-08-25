class WebApi::V1::StatsUsersController < WebApi::V1::StatsController

  # class StatUserQuery < OpenStruct
  #   attr_accesor :group, :project, :topic, :start_at, :end_at
  # end

  @@multiloc_service = MultilocService.new


  before_action :render_no_data, only: [
    :users_by_time,
    :users_by_time_cumulative,
    :active_users_by_time,
  ]
  before_action :render_no_data_as_xlsx, only: [
    :users_by_time_as_xlsx,
    :users_by_time_cumulative_as_xlsx,
    :active_users_by_time_as_xlsx
  ]


  def users_count
    count = User.active
      .where(registration_completed_at: @start_at..@end_at)
      .active
      .count
    render json: { count: count }
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
    render json: {series: {users: users_by_time_serie}}
  end

  def users_by_time_as_xlsx
    xlsx = XlsxService.new.generate_time_stats_xlsx users_by_time_serie, 'users_by_time'
    send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: render_xlsx_file_name('users_by_time')
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
    render json: {series: {users: users_by_time_cumulative_serie}}
  end

  def users_by_time_cumulative_as_xlsx
    xlsx = XlsxService.new.generate_time_stats_xlsx users_by_time_cumulative_serie, 'users_by_time_cumulative'

    send_data xlsx,
     type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
     filename: render_xlsx_file_name('users_by_time_cumulative')
 end

  def active_users_by_time_serie
    activities_scope = Activity
      .select(:user_id).distinct
      .where(user_id: StatUserPolicy::Scope.new(current_user, User.active).resolve)

    ps = ParticipantsService.new
    activities_scope = ps.filter_engaging_activities(activities_scope)

    if params[:project]
      project = Project.find(params[:project])
      participants = ps.projects_participants([project])
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
    render json: {series: {users: active_users_by_time_serie}}
  end

  def active_users_by_time_as_xlsx
    xlsx = XlsxService.new.generate_time_stats_xlsx active_users_by_time_serie, 'active_users_by_time'
    send_data xlsx,
     type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
     filename: render_xlsx_file_name('active_users_by_time')
  end

  def users_by_gender_serie
    users = StatUserPolicy::Scope.new(current_user, User.active).resolve

    if params[:group]
      group = Group.find(params[:group])
      users = users.merge(group.members)
    end

    serie = users
      .where(registration_completed_at: @start_at..@end_at)
      .group("custom_field_values->'gender'")
      .order(Arel.sql("custom_field_values->'gender'"))
      .count

    serie['_blank'] = serie.delete(nil) || 0 unless serie.empty?

    serie
  end

  def users_by_gender
    render json: {series: {users: users_by_gender_serie}}
  end

  def users_by_gender_as_xlsx
    xlsx = XlsxService.new.generate_field_stats_xlsx users_by_gender_serie, 'gender', 'users'
    send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: render_xlsx_file_name('users_by_gender')
  end

  def users_by_birthyear_serie
    users = StatUserPolicy::Scope.new(current_user, User.active).resolve

    if params[:group]
      group = Group.find(params[:group])
      users = users.merge(group.members)
    end

    serie = users
      .where(registration_completed_at: @start_at..@end_at)
      .group("custom_field_values->'birthyear'")
      .order(Arel.sql("custom_field_values->'birthyear'"))
      .count
    serie['_blank'] = serie.delete(nil) || 0 unless serie.empty?

    serie
  end

  def users_by_birthyear
    render json: {series: {users: users_by_birthyear_serie}}
  end

  def users_by_birthyear_as_xlsx
    xlsx = XlsxService.new.generate_field_stats_xlsx users_by_birthyear_serie, 'birthyear', 'users'
    send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: render_xlsx_file_name('users_by_birthyear')
  end

  def users_by_domicile_serie
    users = StatUserPolicy::Scope.new(current_user, User.active).resolve

    if params[:group]
      group = Group.find(params[:group])
      users = users.merge(group.members)
    end

    serie = users
      .where(registration_completed_at: @start_at..@end_at)
      .group("custom_field_values->'domicile'")
      .order(Arel.sql("custom_field_values->'domicile'"))
      .count
    serie['_blank'] = serie.delete(nil) || 0 unless serie.empty?

    serie
  end

  def users_by_domicile
    serie = users_by_domicile_serie
    areas = Area.where(id: serie.keys).select(:id, :title_multiloc)
    render json: {series: {users: serie}, areas: areas.map{|a| [a.id, a.attributes.except('id')]}.to_h}
  end

  def users_by_domicile_as_xlsx
    res = users_by_domicile_serie.map { |area_id, users|
      area = area_id != "_blank" ? @@multiloc_service.t(Area.find(area_id).title_multiloc) : "unknown"
      {
        "area_id" => area_id,
        "area" => area,
        "users" => users
      }
    }
    xlsx = XlsxService.new.generate_res_stats_xlsx res, 'users', 'area'
    send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: render_xlsx_file_name('users_by_domicile')
  end

  def users_by_education_serie
    users = StatUserPolicy::Scope.new(current_user, User.active).resolve

    if params[:group]
      group = Group.find(params[:group])
      users = users.merge(group.members)
    end

    serie = users
      .where(registration_completed_at: @start_at..@end_at)
      .group("custom_field_values->'education'")
      .order(Arel.sql("custom_field_values->'education'"))
      .count
    serie['_blank'] = serie.delete(nil) || 0 unless serie.empty?

    serie
  end
  def users_by_education
    render json: {series: {users: users_by_education_serie}}
  end

  def users_by_education_as_xlsx
    xlsx = XlsxService.new.generate_field_stats_xlsx users_by_education_serie, 'education', 'users'
    send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: render_xlsx_file_name('users_by_education')
  end

  def users_by_custom_field_serie
    users = StatUserPolicy::Scope.new(current_user, User.active).resolve

    if params[:group]
      group = Group.find(params[:group])
      users = users.merge(group.members)
    end

    case @custom_field.input_type
    when 'select'
      serie = users
        .where(registration_completed_at: @start_at..@end_at)
        .group("custom_field_values->'#{@custom_field.key}'")
        .order(Arel.sql("custom_field_values->'#{@custom_field.key}'"))
        .count
      serie['_blank'] = serie.delete(nil) || 0 unless serie.empty?
      serie
    when 'multiselect'
      serie = users
        .joins("LEFT OUTER JOIN (SELECT jsonb_array_elements(custom_field_values->'#{@custom_field.key}') as field_value, id FROM users) as cfv ON users.id = cfv.id")
        .where(registration_completed_at: @start_at..@end_at)
        .group("cfv.field_value")
        .order("cfv.field_value")
        .count
      serie['_blank'] = serie.delete(nil) || 0 unless serie.empty?
      serie
    when 'checkbox'
      serie = users
        .where(registration_completed_at: @start_at..@end_at)
        .group("custom_field_values->'#{@custom_field.key}'")
        .order(Arel.sql("custom_field_values->'#{@custom_field.key}'"))
        .count
      serie['_blank'] = serie.delete(nil) || 0 unless serie.empty?
      serie
    else
      head :not_implemented
    end
  end

  def users_by_custom_field
    @custom_field = CustomField.find(params[:custom_field_id])
    serie = users_by_custom_field_serie
    if ['select', 'multiselect'].include?(@custom_field.input_type)
      options = @custom_field.custom_field_options.where(key: serie.keys).select(:key, :title_multiloc)
      render json: {series: {users: serie}, options: options.map{|o| [o.key, o.attributes.except('key', 'id')]}.to_h}
    else
      render json: {series: {users: serie}}
    end
  end

  def users_by_custom_field_as_xlsx
    @custom_field = CustomField.find(params[:custom_field_id])

    if ['select', 'multiselect'].include?(@custom_field.input_type)
      serie = users_by_custom_field_serie
      options = @custom_field.custom_field_options.where(key: serie.keys).select(:key, :title_multiloc)
      res = serie.map { |option_id, users|
        option = option_id != "_blank" ? @@multiloc_service.t(options.find_by(key: option_id).attributes["title_multiloc"]) : "unknown"
        {
          "option_id" => option_id,
          "option" => option,
          "users" => users
        }
      }
      xlsx = XlsxService.new.generate_res_stats_xlsx res, 'users', 'option'
      send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: render_xlsx_file_name('users_by_custom_field')
    else
      xlsx = XlsxService.new.generate_field_stats_xlsx users_by_custom_field_serie, 'option', 'users'
      send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: render_xlsx_file_name('users_by_custom_field')
    end

  end

  def users_engagement_scores
    ps = ParticipantsService.new
    activities = Activity
      .where(user_id: StatUserPolicy::Scope.new(current_user, User.active).resolve)

    if params[:group]
      group = Group.find(params[:group])
      activities = activities.where(user_id: group.members)
    end

    engaging_activities = ps.filter_engaging_activities(activities)
    scored_activities = ps.with_engagement_scores(engaging_activities)

    serie = Activity
      .from(scored_activities.select(:user_id).where(acted_at: @start_at..@end_at))
      .group(:user_id)
      .includes(:user)
      .select("user_id, SUM(score) as sum_score")
      .order("sum_score DESC")
      .limit(10)

    render json: WebApi::V1::EngagementScoreSerializer.new(
      serie,
      params: fastjson_params,
      include: [:user]
      ).serialized_json
  end

  private

  def render_xlsx_file_name name
    if params[:project]
      project_name = @@multiloc_service.t(Project.find(params[:project]).title_multiloc)
    end

    if params[:group]
      group_name = @@multiloc_service.t(Group.find(params[:group]).title_multiloc) || params[:group]
    end

    if params[:topic]
      topic_name = @@multiloc_service.t(Topic.find(params[:topic]).title_multiloc)
    end

    name + (project_name ? "_p_#{project_name}" : '') + (group_name ? "_g_#{group_name}" : '') + (topic_name ? "_t_#{topic_name}" : '') + '.xlsx'
  end

  def render_no_data
    if @no_data
      render json: {series: {users: {}}}
    end
  end

  def render_no_data_as_xlsx
    if @no_data
      render json: {errors: "no data for this period"}, status: :unprocessable_entity
    end
  end

  def do_authorize
    authorize :stat_user
  end

end
