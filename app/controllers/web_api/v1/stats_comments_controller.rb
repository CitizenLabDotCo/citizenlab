class WebApi::V1::StatsCommentsController < WebApi::V1::StatsController

  before_action :render_no_data, only: [:comments_by_time, :comments_by_time_cumulative]

  def comments_count
    count = StatCommentPolicy::Scope.new(current_user, Comment.published).resolve
      .where(created_at: @start_at..@end_at)
      .published
      .count
      
    render json: { count: count }
  end

  def comments_by_time
    comments = StatCommentPolicy::Scope.new(current_user, Comment.published).resolve

    comments = apply_project_filter(comments)
    comments = apply_topic_filter(comments)
    comments = apply_group_filter(comments)
    
    serie = @@stats_service.group_by_time(
      comments,
      'comments.created_at',
      @start_at,
      @end_at,
      params[:interval]
    )
    render json: {series: {comments: serie}}
  end

  def comments_by_time_cumulative
    comments = StatCommentPolicy::Scope.new(current_user, Comment.published).resolve

    comments = apply_project_filter(comments)
    comments = apply_topic_filter(comments)
    comments = apply_group_filter(comments)
    
    serie = @@stats_service.group_by_time_cumulative(
      comments,
      'comments.created_at',
      @start_at,
      @end_at,
      params[:interval]
    )
    render json: {series: {comments: serie}}
  end

  def comments_by_topic
    comments = StatCommentPolicy::Scope.new(current_user, Comment.published).resolve

    comments = apply_project_filter(comments)
    comments = apply_group_filter(comments)

    serie = comments
      .where(created_at: @start_at..@end_at)
      .joins("INNER JOIN ideas ON ideas.id = comments.post_id")
      .joins("INNER JOIN ideas_topics ON ideas_topics.idea_id = ideas.id")
      .group("ideas_topics.topic_id")
      .order("ideas_topics.topic_id")
      .count
    topics = Topic.where(id: serie.keys).select(:id, :title_multiloc)
    render json: {series: {comments: serie}, topics: topics.map{|t| [t.id, t.attributes.except('id')]}.to_h}
  end

  def comments_by_project
    comments = StatCommentPolicy::Scope.new(current_user, Comment.published).resolve

    comments = apply_topic_filter(comments)
    comments = apply_group_filter(comments)

    serie = comments
      .where(created_at: @start_at..@end_at)
      .joins("INNER JOIN ideas ON ideas.id = comments.post_id")
      .group("ideas.project_id")
      .order("ideas.project_id")
      .count
    projects = Project.where(id: serie.keys).select(:id, :title_multiloc)
    render json: {series: {comments: serie}, projects: projects.map{|p| [p.id, p.attributes.except('id')]}.to_h}
  end

  private

  def apply_project_filter comments
    if params[:project]
      comments.joins("INNER JOIN ideas ON ideas.id = comments.post_id").where(ideas: {project_id: params[:project]})
    else
      comments
    end
  end

  def apply_topic_filter comments
    if params[:topic]
      comments
        .joins("INNER JOIN ideas ON ideas.id = comments.post_id")
        .joins("INNER JOIN ideas_topics ON ideas_topics.idea_id = ideas.id")
        .where(ideas: {ideas_topics: {topic_id: params[:topic]}})
    else
      comments
    end
  end

  def apply_group_filter comments
    if params[:group]
      group = Group.find(params[:group])
      comments.where(author_id: group.members)
    else
      comments
    end
  end

  def render_no_data
    if @no_data
      render json: {series: {comments: {}}}
    end
  end

  def do_authorize
    authorize :stat_comment
  end
end