# frozen_string_literal: true

class WebApi::V1::StatsIdeasController < WebApi::V1::StatsController
  @@multiloc_service = MultilocService.new

  before_action :render_no_data, only: %i[
    ideas_by_time
    ideas_by_time_cumulative
  ]

  before_action :render_no_data_as_xlsx, only: %i[
    ideas_by_time_as_xlsx
    ideas_by_time_cumulative_as_xlsx
  ]

  def ideas_count
    ideas = StatIdeaPolicy::Scope.new(current_user, Idea.published).resolve
      .where(published_at: @start_at..@end_at)
    result = IdeasFinder.new(params, scope: ideas, current_user: current_user, paginate: false).find_records
    render json: { count: result.count }
  end

  def ideas_by_topic_serie
    ideas = StatIdeaPolicy::Scope.new(current_user, Idea.published).resolve
    ideas = IdeasFinder.new(params, scope: ideas, current_user: current_user).find_records

    ideas
      .where(published_at: @start_at..@end_at)
      .joins(:ideas_topics)
      .group('ideas_topics.topic_id')
      .order('ideas_topics.topic_id')
      .count
  end

  def ideas_by_topic
    serie = ideas_by_topic_serie
    topics = Topic.pluck(:id, :title_multiloc).map do |id, title_multiloc|
      [id, { title_multiloc: title_multiloc }]
    end
    render json: { series: { ideas: serie }, topics: topics.to_h }
  end

  def ideas_by_topic_as_xlsx
    serie = ideas_by_topic_serie

    topics = Topic.where(id: serie.keys).select(:id, :title_multiloc)

    res = []
    serie.each do |topic_id, count|
      res.push({
        'topic' => @@multiloc_service.t(topics.find(topic_id).title_multiloc),
        'topic_id' => topic_id,
        'ideas' => count
      })
    end

    xlsx = XlsxService.new.generate_res_stats_xlsx res, 'ideas', 'topic'

    send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'ideas_by_topic.xlsx'
  end

  def ideas_by_project_serie
    ideas = StatIdeaPolicy::Scope.new(current_user, Idea.published).resolve
    ideas = IdeasFinder.new(params, scope: ideas, current_user: current_user).find_records

    ideas
      .where(published_at: @start_at..@end_at)
      .group(:project_id)
      .order(:project_id)
      .count
  end

  def ideas_by_project
    serie = ideas_by_project_serie
    projects = Project.where(id: serie.keys).select(:id, :title_multiloc)
    render json: { series: { ideas: serie }, projects: projects.to_h { |t| [t.id, t.attributes.except('id')] } }
  end

  def ideas_by_project_as_xlsx
    serie = ideas_by_project_serie
    projects = Project.where(id: serie.keys).select(:id, :title_multiloc)

    res = serie.map do |project_id, count|
      {
        'project' => @@multiloc_service.t(projects.find(project_id).title_multiloc),
        'project_id' => project_id,
        'ideas' => count
      }
    end

    xlsx = XlsxService.new.generate_res_stats_xlsx res, 'ideas', 'project'

    send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'ideas_by_project.xlsx'
  end

  def ideas_by_status_serie
    ideas = StatIdeaPolicy::Scope.new(current_user, Idea.published).resolve
    ideas = IdeasFinder.new(params, scope: ideas, current_user: current_user).find_records

    ideas
      .where(published_at: @start_at..@end_at)
      .group(:idea_status_id)
      .order(:idea_status_id)
      .count
  end

  def ideas_by_status
    serie = ideas_by_status_serie
    idea_statuses = IdeaStatus.all.select(:id, :title_multiloc, :color, :ordering).order(:ordering)
    render json: { series: { ideas: serie }, idea_status: idea_statuses.to_h { |a| [a.id, a.attributes.except('id')] } }
  end

  def ideas_by_status_as_xlsx
    res = []
    ideas_by_status_serie.each do |status_id, count|
      res.push({
        'status' => @@multiloc_service.t(IdeaStatus.find(status_id).title_multiloc),
        'status_id' => status_id,
        'ideas' => count
      })
    end

    xlsx = XlsxService.new.generate_res_stats_xlsx res, 'ideas', 'status'

    send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'ideas_by_status.xlsx'
  end

  def ideas_by_time
    render json: { series: { ideas: ideas_by_time_serie } }
  end

  def ideas_by_time_as_xlsx
    name = 'ideas_by_time'
    xlsx = XlsxService.new.generate_time_stats_xlsx ideas_by_time_serie, name
    send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: "#{name}.xlsx"
  end

  def ideas_by_time_cumulative
    render json: { series: { ideas: ideas_by_time_cumulative_serie } }
  end

  def ideas_by_time_cumulative_as_xlsx
    name = 'ideas_by_time_cumulative'
    xlsx = XlsxService.new.generate_time_stats_xlsx ideas_by_time_cumulative_serie, name
    send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: "#{name}.xlsx"
  end

  private

  def ideas_by_time_cumulative_serie
    ideas = StatIdeaPolicy::Scope.new(current_user, Idea.published).resolve
    ideas = IdeasFinder.new(params, scope: ideas, current_user: current_user).find_records

    @@stats_service.group_by_time_cumulative(
      ideas,
      'published_at',
      @start_at,
      @end_at,
      params[:interval]
    )
  end

  def ideas_by_time_serie
    ideas = StatIdeaPolicy::Scope.new(current_user, Idea.published).resolve
    ideas = IdeasFinder.new(params, scope: ideas, current_user: current_user).find_records

    @@stats_service.group_by_time(
      ideas,
      'published_at',
      @start_at,
      @end_at,
      params[:interval]
    )
  end

  def render_no_data
    return unless @no_data

    render json: { series: { ideas: {} } }
  end

  def render_no_data_as_xlsx
    return unless @no_data

    render json: { errors: 'no data for this period' }, status: :unprocessable_entity
  end

  def do_authorize
    authorize :stat_idea
  end
end
