class WebApi::V1::StatsIdeasController < WebApi::V1::StatsController

  before_action :render_no_data, only: [
    :ideas_by_time,
    :ideas_by_time_cumulative,
  ]

  def ideas_count
    count = StatIdeaPolicy::Scope.new(current_user, Idea.published).resolve
      .where(published_at: @start_at..@end_at)
      .count
      
    render json: { count: count }
  end

  def ideas_by_topic
    ideas = StatIdeaPolicy::Scope.new(current_user, Idea.published).resolve

    ideas = ideas.where(project_id: params[:project]) if params[:project]
    if params[:group]
      group = Group.find(params[:group])
      ideas = ideas.joins(:author).where(author: group.members)
    end

    serie = ideas
      .where(published_at: @start_at..@end_at)
      .joins(:ideas_topics)
      .group("ideas_topics.topic_id")
      .order("ideas_topics.topic_id")
      .count

    topics = Topic.where(id: serie.keys).select(:id, :title_multiloc)
    render json: {series: {ideas: serie}, topics: topics.map{|t| [t.id, t.attributes.except('id')]}.to_h}
  end

  def ideas_by_project
    ideas = StatIdeaPolicy::Scope.new(current_user, Idea.published).resolve

    ideas = ideas.with_some_topics([params[:topic]]) if params[:topic]
    if params[:group]
      group = Group.find(params[:group])
      ideas = ideas.joins(:author).where(author: group.members)
    end

    serie = ideas
      .where(published_at: @start_at..@end_at)
      .group(:project_id)
      .order(:project_id)
      .count

    projects = Project.where(id: serie.keys).select(:id, :title_multiloc)
    render json: {series: {ideas: serie}, projects: projects.map{|t| [t.id, t.attributes.except('id')]}.to_h}
  end

  def ideas_by_area
    serie = StatIdeaPolicy::Scope.new(current_user, Idea.published).resolve
      .where(published_at: @start_at..@end_at)
      .joins(:areas_ideas)
      .group("areas_ideas.area_id")
      .order("areas_ideas.area_id")
      .count
    areas = Area.where(id: serie.keys).select(:id, :title_multiloc)
    render json: {series: {ideas: serie}, areas: areas.map{|a| [a.id, a.attributes.except('id')]}.to_h}
  end

  def ideas_by_time
    serie = @@stats_service.group_by_time(
      StatIdeaPolicy::Scope.new(current_user, Idea.published).resolve,
      'published_at',
      @start_at,
      @end_at,
      params[:interval]
    )
    render json: {series: {ideas: serie}}
  end

  def ideas_by_time_cumulative
    serie = @@stats_service.group_by_time_cumulative(
      StatIdeaPolicy::Scope.new(current_user, Idea.published).resolve,
      'published_at',
      @start_at,
      @end_at,
      params[:interval]
    )
    render json: {series: {ideas: serie}}
  end


  private

  def render_no_data
    if @no_data
      render json: {series: {ideas: {}}}
    end
  end

  def do_authorize
    authorize :stat_idea
  end
end