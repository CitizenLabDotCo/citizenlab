# frozen_string_literal: true

class WebApi::V1::StatsIdeasController < WebApi::V1::StatsController
  @@multiloc_service = MultilocService.new

  # def ideas_count
  #   ideas = policy_scope(Idea.published, policy_scope_class: StatIdeaPolicy::Scope)
  #     .where(published_at: @start_at..@end_at)
  #   result = IdeasFinder.new(params, scope: ideas, current_user: current_user).find_records
  #   render json: raw_json({ count: result.count })
  # end

  def ideas_by_topic_serie(limit = nil)
    ideas = policy_scope(Idea.published, policy_scope_class: StatIdeaPolicy::Scope)
    ideas = IdeasFinder.new(params, scope: ideas, current_user: current_user).find_records

    serie = ideas
      .where(published_at: @start_at..@end_at)
      .joins(:ideas_input_topics)
      .group('ideas_input_topics.input_topic_id')
      .order('count_id DESC')
      .limit(limit)
      .count('id')

    IdeasCountService.aggregate_child_input_topic_counts(serie)
  end

  def ideas_by_topic
    serie = ideas_by_topic_serie(params[:limit])
    topics = InputTopic.where(id: serie.keys).pluck(:id, :title_multiloc).map do |id, title_multiloc|
      [id, { title_multiloc: title_multiloc }]
    end
    render json: raw_json({ series: { ideas: serie }, topics: topics.to_h })
  end

  def ideas_by_topic_as_xlsx
    serie = ideas_by_topic_serie

    topics = InputTopic.where(id: serie.keys).select(:id, :title_multiloc)

    res = serie.map do |topic_id, count|
      {
        'topic' => @@multiloc_service.t(topics.find(topic_id).title_multiloc, current_user&.locale),
        'topic_id' => topic_id,
        'ideas' => count
      }
    end

    xlsx = XlsxService.new.generate_res_stats_xlsx res, 'ideas', 'topic'

    send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'ideas_by_topic.xlsx'
  end

  def ideas_by_project_serie
    ideas = policy_scope(Idea.published, policy_scope_class: StatIdeaPolicy::Scope)
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
        'project' => @@multiloc_service.t(projects.find(project_id).title_multiloc, current_user&.locale),
        'project_id' => project_id,
        'ideas' => count
      }
    end

    xlsx = XlsxService.new.generate_res_stats_xlsx res, 'ideas', 'project'

    send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'ideas_by_project.xlsx'
  end

  private

  def do_authorize
    authorize :stat_idea
  end
end
