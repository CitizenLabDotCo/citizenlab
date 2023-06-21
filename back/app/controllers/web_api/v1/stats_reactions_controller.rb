# frozen_string_literal: true

class WebApi::V1::StatsReactionsController < WebApi::V1::StatsController
  @@multiloc_service = MultilocService.new

  def reactions_count
    count = StatReactionPolicy::Scope.new(current_user, Reaction).resolve
      .where(reactable_type: 'Idea')
      .where(created_at: @start_at..@end_at)
      .group(:mode)
      .count
    render json: {
      up: count['up'],
      down: count['down'],
      total: (count['up'] || 0) + (count['down'] || 0)
    }
  end

  def reactions_by_topic_serie
    reactions = StatReactionPolicy::Scope.new(current_user, Reaction).resolve
      .where(reactable_type: 'Idea')
      .joins('JOIN ideas ON ideas.id = reactions.reactable_id')

    reactions = apply_group_filter(reactions)
    reactions = apply_project_filter(reactions)

    reactions
      .where(created_at: @start_at..@end_at)
      .joins('JOIN ideas_topics ON ideas_topics.idea_id = ideas.id')
      .group('ideas_topics.topic_id')
      .order('ideas_topics.topic_id')
      .count
  end

  def reactions_by_topic
    serie = reactions_by_topic_serie
    topics = Topic.all.select(:id, :title_multiloc)
    render json: raw_json({ series: { total: serie }, topics: topics.to_h { |t| [t.id, t.attributes.except('id')] } })
  end

  def reactions_by_topic_as_xlsx
    serie = reactions_by_topic_serie
    topics = Topic.where(id: serie.keys).select(:id, :title_multiloc)
    res = serie.map do |topic_id, count|
      {
        'topic' => @@multiloc_service.t(topics.find(topic_id).title_multiloc),
        'topic_id' => topic_id,
        'reactions' => count
      }
    end

    xlsx = XlsxService.new.generate_res_stats_xlsx res, 'reactions', 'topic'

    send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'reactions_by_topic.xlsx'
  end

  def reactions_by_project_serie
    reactions = StatReactionPolicy::Scope.new(current_user, Reaction).resolve
      .where(reactable_type: 'Idea')
      .joins('JOIN ideas ON ideas.id = reactions.reactable_id')

    reactions = apply_group_filter(reactions)
    reactions = apply_topic_filter(reactions)

    reactions
      .where(created_at: @start_at..@end_at)
      .group('ideas.project_id')
      .order('ideas.project_id')
      .count
  end

  def reactions_by_project
    serie = reactions_by_project_serie
    projects = Project.where(id: serie.keys).select(:id, :title_multiloc)
    render json: raw_json({ series: { total: serie }, projects: projects.to_h { |p| [p.id, p.attributes.except('id')] } })
  end

  def reactions_by_project_as_xlsx
    serie = reactions_by_project_serie
    projects = Project.where(id: serie.keys).select(:id, :title_multiloc)
    res = serie.map do |project_id, count|
      {
        'project' => @@multiloc_service.t(projects.find(project_id).title_multiloc),
        'project_id' => project_id,
        'reactions' => count
      }
    end

    xlsx = XlsxService.new.generate_res_stats_xlsx res, 'reactions', 'project'

    send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'reactions_by_project.xlsx'
  end

  private

  def apply_group_filter(reactions)
    if params[:group]
      group = Group.find(params[:group])
      reactions.where(user_id: group.members)
    else
      reactions
    end
  end

  def apply_project_filter(reactions)
    if params[:project]
      reactions.where(ideas: { project_id: params[:project] })
    else
      reactions
    end
  end

  def apply_topic_filter(reactions)
    if params[:topic]
      reactions
        .joins('JOIN ideas_topics ON ideas.id = ideas_topics.idea_id')
        .where(ideas_topics: { topic_id: params[:topic] })
    else
      reactions
    end
  end

  def do_authorize
    authorize :stat_reaction
  end
end
