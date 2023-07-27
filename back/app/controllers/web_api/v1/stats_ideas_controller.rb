# frozen_string_literal: true

class WebApi::V1::StatsIdeasController < WebApi::V1::StatsController
  @@multiloc_service = MultilocService.new

  def ideas_count
    ideas = StatIdeaPolicy::Scope.new(current_user, Idea.published).resolve
      .where(published_at: @start_at..@end_at)
    result = IdeasFinder.new(params, scope: ideas, current_user: current_user).find_records
    render json: raw_json({ count: result.count })
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
    render json: raw_json({ series: { ideas: serie }, topics: topics.to_h })
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
    render json: raw_json({ series: { ideas: serie }, projects: projects.to_h { |t| [t.id, t.attributes.except('id')] } })
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
    render json: raw_json({ series: { ideas: serie }, idea_status: idea_statuses.to_h { |a| [a.id, a.attributes.except('id')] } })
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

  private

  def do_authorize
    authorize :stat_idea
  end
end
