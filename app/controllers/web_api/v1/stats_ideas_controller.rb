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
    ideas = PostsFilteringService.new.apply_common_idea_index_filters ideas, params

    render json: { count: ideas.count }
  end

  def ideas_by_topic
    ideas = StatIdeaPolicy::Scope.new(current_user, Idea.published).resolve

    ideas = apply_project_filter(ideas)
    ideas = apply_group_filter(ideas)
    ideas = apply_feedback_needed_filter(ideas)

    serie = ideas
      .where(published_at: @start_at..@end_at)
      .joins(:ideas_topics)
      .group("ideas_topics.topic_id")
      .order("ideas_topics.topic_id")
      .count

    topics = Topic.where(id: serie.keys).select(:id, :title_multiloc)
    render json: {series: {ideas: serie}, topics: topics.map{|t| [t.id, t.attributes.except('id')]}.to_h}
  end

  def ideas_by_topic_as_xlsx
    ideas = StatIdeaPolicy::Scope.new(current_user, Idea.published).resolve

    ideas = apply_project_filter(ideas)
    ideas = apply_group_filter(ideas)
    ideas = apply_feedback_needed_filter(ideas)
    res = []
    serie = ideas
      .where(published_at: @start_at..@end_at)
      .joins(:ideas_topics)
      .group("ideas_topics.topic_id")
      .order("ideas_topics.topic_id")
      .count

    serie.each {|topic_id, count|
      res.push({
        "topic" => @@multiloc_service.t(Topic.find(topic_id).title_multiloc),
        "ideas" => count
      })
    }

    xlsx = XlsxService.new.generate_res_stats_xlsx res, "ideas", "topic"

    send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: render_xlsx_file_name("ideas_by_topic")
  end

  def ideas_by_project
    ideas = StatIdeaPolicy::Scope.new(current_user, Idea.published).resolve

    ideas = apply_topic_filter(ideas)
    ideas = apply_group_filter(ideas)
    ideas = apply_feedback_needed_filter(ideas)

    serie = ideas
      .where(published_at: @start_at..@end_at)
      .group(:project_id)
      .order(:project_id)
      .count

    projects = Project.where(id: serie.keys).select(:id, :title_multiloc)
    render json: {series: {ideas: serie}, projects: projects.map{|t| [t.id, t.attributes.except('id')]}.to_h}
  end

  def ideas_by_area
    ideas = StatIdeaPolicy::Scope.new(current_user, Idea.published).resolve

    ideas = apply_project_filter(ideas)
    ideas = apply_group_filter(ideas)
    ideas = apply_topic_filter(ideas)
    ideas = apply_feedback_needed_filter(ideas)

    serie = ideas
      .where(published_at: @start_at..@end_at)
      .joins(:areas_ideas)
      .group("areas_ideas.area_id")
      .order("areas_ideas.area_id")
      .count
    areas = Area.where(id: serie.keys).select(:id, :title_multiloc)
    render json: {series: {ideas: serie}, areas: areas.map{|a| [a.id, a.attributes.except('id')]}.to_h}
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
    send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: render_xlsx_file_name(name)
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
    send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: render_xlsx_file_name(name)
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

    name + (project_name ? "_project_#{project_name}" : '') + (group_name ? "_group_#{group_name}" : '') + (topic_name ? "_topic_#{topic_name}" : '') + '.xlsx'
  end

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
