# frozen_string_literal: true

class WebApi::V1::StatsCommentsController < WebApi::V1::StatsController
  @@multiloc_service = MultilocService.new

  def comments_count
    count = policy_scope(Comment.published, policy_scope_class: StatCommentPolicy::Scope)
      .where(created_at: @start_at..@end_at)
      .published
      .count

    render json: raw_json({ count: count })
  end

  def comments_by_topic_serie
    comments = policy_scope(Comment.published, policy_scope_class: StatCommentPolicy::Scope)
    comments = apply_project_filter(comments)
    comments = apply_group_filter(comments)

    comments
      .where(created_at: @start_at..@end_at)
      .joins('INNER JOIN ideas ON ideas.id = comments.post_id')
      .joins('INNER JOIN ideas_topics ON ideas_topics.idea_id = ideas.id')
      .group('ideas_topics.topic_id')
      .order('ideas_topics.topic_id')
      .count
  end

  def comments_by_topic
    serie = comments_by_topic_serie
    topics = Topic.pluck(:id, :title_multiloc).map do |id, title_multiloc|
      [id, { title_multiloc: title_multiloc }]
    end
    render json: raw_json({ series: { comments: serie }, topics: topics.to_h })
  end

  def comments_by_topic_as_xlsx
    serie = comments_by_topic_serie
    topics = Topic.where(id: serie.keys).select(:id, :title_multiloc)
    res = serie.map do |topic_id, count|
      {
        'topic' => @@multiloc_service.t(topics.find(topic_id).title_multiloc, current_user&.locale),
        'topic_id' => topic_id,
        'comments' => count
      }
    end

    xlsx = XlsxService.new.generate_res_stats_xlsx res, 'comments', 'topic'

    send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'comments_by_topic.xlsx'
  end

  def comments_by_project_serie
    comments = policy_scope(Comment.published, policy_scope_class: StatCommentPolicy::Scope)
    comments = apply_topic_filter(comments)
    comments = apply_group_filter(comments)

    comments
      .where(created_at: @start_at..@end_at)
      .joins('INNER JOIN ideas ON ideas.id = comments.post_id')
      .group('ideas.project_id')
      .order('ideas.project_id')
      .count
  end

  def comments_by_project
    serie = comments_by_project_serie
    projects = Project.where(id: serie.keys).select(:id, :title_multiloc)
    render json: raw_json({ series: { comments: serie }, projects: projects.to_h { |p| [p.id, p.attributes.except('id')] } })
  end

  def comments_by_project_as_xlsx
    serie = comments_by_project_serie
    projects = Project.where(id: serie.keys).select(:id, :title_multiloc)
    res = serie.map do |project_id, count|
      {
        'project' => @@multiloc_service.t(projects.find(project_id).title_multiloc, current_user&.locale),
        'project_id' => project_id,
        'comments' => count
      }
    end

    xlsx = XlsxService.new.generate_res_stats_xlsx res, 'comments', 'project'

    send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'comments_by_project.xlsx'
  end

  private

  def apply_project_filter(comments)
    if params[:project]
      comments.joins('INNER JOIN ideas ON ideas.id = comments.post_id').where(ideas: { project_id: params[:project] })
    else
      comments
    end
  end

  def apply_topic_filter(comments)
    if params[:topic]
      comments
        .joins('INNER JOIN ideas ON ideas.id = comments.post_id')
        .joins('INNER JOIN ideas_topics ON ideas_topics.idea_id = ideas.id')
        .where(ideas: { ideas_topics: { topic_id: params[:topic] } })
    else
      comments
    end
  end

  def apply_group_filter(comments)
    if params[:group]
      group = Group.find(params[:group])
      comments.where(author_id: group.members)
    else
      comments
    end
  end

  def do_authorize
    authorize :stat_comment
  end
end
