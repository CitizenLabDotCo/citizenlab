class WebApi::V1::StatsCommentsController < WebApi::V1::StatsController

  @@multiloc_service = MultilocService.new

  before_action :render_no_data, only: [:comments_by_time, :comments_by_time_cumulative]
  before_action :render_no_data_as_xlsx, only: [:comments_by_time_as_xlsx, :comments_by_time_cumulative_as_xlsx]

  def comments_count
    count = StatCommentPolicy::Scope.new(current_user, Comment.published).resolve
      .where(created_at: @start_at..@end_at)
      .published
      .count

    render json: { count: count }
  end

  def comments_by_time_serie
    comments = StatCommentPolicy::Scope.new(current_user, Comment.published).resolve

    comments = apply_project_filter(comments)
    comments = apply_topic_filter(comments)
    comments = apply_group_filter(comments)

    @@stats_service.group_by_time(
      comments,
      'comments.created_at',
      @start_at,
      @end_at,
      params[:interval]
    )
  end

  def comments_by_time
    render json: {series: {comments: comments_by_time_serie}}
  end

  def comments_by_time_as_xlsx
    xlsx = XlsxService.new.generate_time_stats_xlsx comments_by_time_serie, 'comments_by_time'
    send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'comments_by_time.xlsx'
  end


  def comments_by_time_cumulative_serie
    comments = StatCommentPolicy::Scope.new(current_user, Comment.published).resolve

    comments = apply_project_filter(comments)
    comments = apply_topic_filter(comments)
    comments = apply_group_filter(comments)

    @@stats_service.group_by_time_cumulative(
      comments,
      'comments.created_at',
      @start_at,
      @end_at,
      params[:interval]
    )
  end

  def comments_by_time_cumulative
    render json: {series: {comments: comments_by_time_cumulative_serie}}
  end

  def comments_by_time_cumulative_as_xlsx
    xlsx = XlsxService.new.generate_time_stats_xlsx comments_by_time_cumulative_serie, 'comments_by_time_cumulative'
    send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'comments_by_time_cumulative.xlsx'
  end

  def comments_by_topic_serie
    comments = StatCommentPolicy::Scope.new(current_user, Comment.published).resolve

    comments = apply_project_filter(comments)
    comments = apply_group_filter(comments)

    comments
      .where(created_at: @start_at..@end_at)
      .joins("INNER JOIN ideas ON ideas.id = comments.post_id")
      .joins("INNER JOIN ideas_topics ON ideas_topics.idea_id = ideas.id")
      .group("ideas_topics.topic_id")
      .order("ideas_topics.topic_id")
      .count
    end

  def comments_by_topic
    serie = comments_by_topic_serie
    topics = Topic.pluck :id, :title_multiloc
    render json: {series: {comments: serie}, topics: topics.map{|id, title_multiloc| [id, {title_multiloc: title_multiloc}]}.to_h}
  end

  def comments_by_topic_as_xlsx
    serie = comments_by_topic_serie
    topics = Topic.where(id: serie.keys).select(:id, :title_multiloc)
    res = serie.map {|topic_id, count|
      {
        "topic" => @@multiloc_service.t(topics.find(topic_id).title_multiloc),
        "topic_id" => topic_id,
        "comments" => count
      }
    }

    xlsx = XlsxService.new.generate_res_stats_xlsx res, "comments", "topic"

    send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: "comments_by_topic.xlsx"
  end

  def comments_by_project_serie
    comments = StatCommentPolicy::Scope.new(current_user, Comment.published).resolve

    comments = apply_topic_filter(comments)
    comments = apply_group_filter(comments)

    comments
      .where(created_at: @start_at..@end_at)
      .joins("INNER JOIN ideas ON ideas.id = comments.post_id")
      .group("ideas.project_id")
      .order("ideas.project_id")
      .count
  end

  def comments_by_project
    serie = comments_by_project_serie
    projects = Project.where(id: serie.keys).select(:id, :title_multiloc)
    render json: {series: {comments: serie}, projects: projects.map{|p| [p.id, p.attributes.except('id')]}.to_h}
  end

  def comments_by_project_as_xlsx
    serie = comments_by_project_serie
    projects = Project.where(id: serie.keys).select(:id, :title_multiloc)
    res = serie.map {|project_id, count|
      {
        "project" => @@multiloc_service.t(projects.find(project_id).title_multiloc),
        "project_id" => project_id,
        "comments" => count
      }
    }

    xlsx = XlsxService.new.generate_res_stats_xlsx res, "comments", "project"

    send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: "comments_by_project.xlsx"
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

  def render_no_data_as_xlsx
    if @no_data
      render json: {errors: "no data for this period"}, status: :unprocessable_entity
    end
  end

  def do_authorize
    authorize :stat_comment
  end
end
