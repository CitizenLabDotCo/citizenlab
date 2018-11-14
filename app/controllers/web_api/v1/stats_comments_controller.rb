class WebApi::V1::StatsCommentsController < WebApi::V1::StatsController

  before_action :render_no_data, only: [:comments_by_time, :comments_by_time_cumulative]

  def comments_count
    count = Comment.published
      .where(created_at: @start_at..@end_at)
      .published
      .count
      
    render json: { count: count }
  end

  def comments_by_time
    serie = @@stats_service.group_by_time(
      Comment.published,
      'created_at',
      @start_at,
      @end_at,
      params[:interval]
    )
    render json: {series: {comments: serie}}
  end

  def comments_by_time_cumulative
    serie = @@stats_service.group_by_time_cumulative(
      Comment.published,
      'created_at',
      @start_at,
      @end_at,
      params[:interval]
    )
    render json: {series: {comments: serie}}
  end

  def comments_by_topic
    comments = Comment.published

    if params[:project]
      comments = comments.joins(:idea).where(ideas: {project_id: params[:project]})
    end

    if params[:group]
      group = Group.find(params[:group])
      comments = comments.where(author_id: group.members)
    end

    serie = comments
      .where(created_at: @start_at..@end_at)
      .joins(idea: :ideas_topics)
      .group("ideas_topics.topic_id")
      .order("ideas_topics.topic_id")
      .count
    topics = Topic.where(id: serie.keys).select(:id, :title_multiloc)
    render json: {series: {comments: serie}, topics: topics.map{|t| [t.id, t.attributes.except('id')]}.to_h}
  end

  def comments_by_project
    comments = Comment.published

    if params[:topic]
      comments = comments
        .joins(idea: :ideas_topics)
        .where(ideas: {ideas_topics: {topic_id: params[:topic]}})
    end

    if params[:group]
      group = Group.find(params[:group])
      comments = comments.where(author_id: group.members)
    end

    serie = comments
      .where(created_at: @start_at..@end_at)
      .joins(:idea)
      .group("ideas.project_id")
      .order("ideas.project_id")
      .count
    projects = Project.where(id: serie.keys).select(:id, :title_multiloc)
    render json: {series: {comments: serie}, projects: projects.map{|p| [p.id, p.attributes.except('id')]}.to_h}
  end

  private

  def render_no_data
    if @no_data
      render json: {series: {comments: {}}}
    end
  end

end