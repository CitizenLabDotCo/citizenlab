class WebApi::V1::StatsIdeasController < WebApi::V1::StatsController

  @@multiloc_service = MultilocService.new

  before_action :render_no_data, only: [
    :ideas_by_time,
    :ideas_by_time_cumulative,
  ]

  before_action :render_no_data_as_xlsx, only: [
    :ideas_by_time_as_xlsx,
    :ideas_by_time_cumulative_as_xlsx,
  ]

  def ideas_count
    ideas = StatIdeaPolicy::Scope.new(current_user, Idea.published).resolve
                                 .where(published_at: @start_at..@end_at)
    @result = IdeasFinder.find(params, scope: ideas, authorize_with: current_user)

    render json: { count: @result.count }
  end

  def ideas_by_topic_serie
    ideas = StatIdeaPolicy::Scope.new(current_user, Idea.published).resolve

    ideas = apply_project_filter(ideas)
    ideas = apply_group_filter(ideas)
    ideas = apply_feedback_needed_filter(ideas)

    ideas
      .where(published_at: @start_at..@end_at)
      .joins(:ideas_topics)
      .group("ideas_topics.topic_id")
      .order("ideas_topics.topic_id")
      .count
  end

  def ideas_by_topic
    serie = ideas_by_topic_serie
    topics = Topic.pluck :id, :title_multiloc
    render json: {series: {ideas: serie}, topics: topics.map{|id, title_multiloc| [id, {title_multiloc: title_multiloc}]}.to_h}
  end

  def ideas_by_topic_as_xlsx
    serie = ideas_by_topic_serie

    topics = Topic.where(id: serie.keys).select(:id, :title_multiloc)

    res = []
    serie.each {|topic_id, count|
      res.push({
        "topic" => @@multiloc_service.t(topics.find(topic_id).title_multiloc),
        "topic_id" => topic_id,
        "ideas" => count
      })
    }

    xlsx = XlsxService.new.generate_res_stats_xlsx res, "ideas", "topic"

    send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: "ideas_by_topic.xlsx"
  end

  def ideas_by_project_serie
    ideas = StatIdeaPolicy::Scope.new(current_user, Idea.published).resolve

    ideas = apply_topic_filter(ideas)
    ideas = apply_group_filter(ideas)
    ideas = apply_feedback_needed_filter(ideas)

    ideas
      .where(published_at: @start_at..@end_at)
      .group(:project_id)
      .order(:project_id)
      .count
  end

  def ideas_by_project
    serie = ideas_by_project_serie
    projects = Project.where(id: serie.keys).select(:id, :title_multiloc)
    render json: {series: {ideas: serie}, projects: projects.map{|t| [t.id, t.attributes.except('id')]}.to_h}
  end

  def ideas_by_project_as_xlsx
    serie = ideas_by_project_serie
    projects = Project.where(id: serie.keys).select(:id, :title_multiloc)

    res = serie.map {|project_id, count|
      {
        "project" => @@multiloc_service.t(projects.find(project_id).title_multiloc),
        "project_id" => project_id,
        "ideas" => count
      }
    }

    xlsx = XlsxService.new.generate_res_stats_xlsx res, "ideas", "project"

    send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: "ideas_by_project.xlsx"
  end

  def ideas_by_area_serie
    ideas = StatIdeaPolicy::Scope.new(current_user, Idea.published).resolve

    ideas = apply_project_filter(ideas)
    ideas = apply_group_filter(ideas)
    ideas = apply_topic_filter(ideas)
    ideas = apply_feedback_needed_filter(ideas)

    ideas
      .where(published_at: @start_at..@end_at)
      .joins(:areas_ideas)
      .group("areas_ideas.area_id")
      .order("areas_ideas.area_id")
      .count
  end

  def ideas_by_area
    serie = ideas_by_area_serie
    areas = Area.where(id: serie.keys).select(:id, :title_multiloc)
    render json: {series: {ideas: serie}, areas: areas.map{|a| [a.id, a.attributes.except('id')]}.to_h}
  end

  def ideas_by_area_as_xlsx
    res = []
    ideas_by_area_serie.each {|area_id, count|
      res.push({
        "area" => @@multiloc_service.t(Area.find(area_id).title_multiloc),
        "area_id" => area_id,
        "ideas" => count
      })
    }

    xlsx = XlsxService.new.generate_res_stats_xlsx res, "ideas", "area"

    send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: "ideas_by_area.xlsx"
  end

  def ideas_by_status_serie
    ideas = StatIdeaPolicy::Scope.new(current_user, Idea.published).resolve

    ideas = apply_project_filter(ideas)
    ideas = apply_group_filter(ideas)
    ideas = apply_topic_filter(ideas)
    ideas = apply_feedback_needed_filter(ideas)

    ideas
      .where(published_at: @start_at..@end_at)
      .group(:idea_status_id)
      .order(:idea_status_id)
      .count
  end

  def ideas_by_status
    serie = ideas_by_status_serie
    idea_statuses = IdeaStatus.all.select(:id, :title_multiloc, :color, :ordering).order(:ordering)
    render json: {series: {ideas: serie}, idea_status: idea_statuses.map{|a| [a.id, a.attributes.except('id')]}.to_h}
  end

  def ideas_by_status_as_xlsx
    res = []
    ideas_by_status_serie.each {|status_id, count|
      res.push({
        "status" => @@multiloc_service.t(IdeaStatus.find(status_id).title_multiloc),
        "status_id" => status_id,
        "ideas" => count
      })
    }

    xlsx = XlsxService.new.generate_res_stats_xlsx res, "ideas", "status"

    send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: "ideas_by_status.xlsx"
  end

  def ideas_by_time_serie
    ideas = StatIdeaPolicy::Scope.new(current_user, Idea.published).resolve

    ideas = apply_project_filter(ideas)
    ideas = apply_group_filter(ideas)
    ideas = apply_topic_filter(ideas)
    ideas = apply_feedback_needed_filter(ideas)

    @@stats_service.group_by_time(
      ideas,
      'published_at',
      @start_at,
      @end_at,
      params[:interval]
    )
  end

  def ideas_by_time
    render json: {series: {ideas: ideas_by_time_serie}}
  end

  def ideas_by_time_as_xlsx
    name = 'ideas_by_time'
    xlsx = XlsxService.new.generate_time_stats_xlsx ideas_by_time_serie, name
    send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: name + '.xlsx'
  end

  def ideas_by_time_cumulative_serie
    ideas = StatIdeaPolicy::Scope.new(current_user, Idea.published).resolve

    ideas = apply_project_filter(ideas)
    ideas = apply_group_filter(ideas)
    ideas = apply_topic_filter(ideas)
    ideas = apply_feedback_needed_filter(ideas)

    @@stats_service.group_by_time_cumulative(
      ideas,
      'published_at',
      @start_at,
      @end_at,
      params[:interval]
    )
  end

  def ideas_by_time_cumulative
    render json: {series: {ideas: ideas_by_time_cumulative_serie}}
  end

  def ideas_by_time_cumulative_as_xlsx
    name = 'ideas_by_time_cumulative'
    xlsx = XlsxService.new.generate_time_stats_xlsx ideas_by_time_cumulative_serie, name
    send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: name + '.xlsx'
  end


  private

  def apply_group_filter ideas
    if params[:group]
      group = Group.find(params[:group])
      ideas.joins(:author).where(author: group.members)
    else
      ideas
    end
  end

  def apply_topic_filter ideas
    if params[:topic]
      ideas.with_some_topics([params[:topic]])
    else
      ideas
    end
  end

  def apply_project_filter ideas
    if params[:project]
      ideas.where(project_id: params[:project])
    else
      ideas
    end
  end

  def apply_feedback_needed_filter ideas
    if params[:feedback_needed].present?
      ideas.feedback_needed
    else
      ideas
    end
  end

  def render_no_data
    if @no_data
      render json: {series: {ideas: {}}}
    end
  end

  def render_no_data_as_xlsx
    if @no_data
      render json: {errors: "no data for this period"}, status: :unprocessable_entity
    end
  end

  def do_authorize
    authorize :stat_idea
  end
end
