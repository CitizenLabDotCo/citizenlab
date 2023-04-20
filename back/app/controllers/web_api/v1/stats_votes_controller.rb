# frozen_string_literal: true

class WebApi::V1::StatsVotesController < WebApi::V1::StatsController
  @@multiloc_service = MultilocService.new

  def votes_count
    count = StatVotePolicy::Scope.new(current_user, Vote).resolve
      .where(votable_type: 'Idea')
      .where(created_at: @start_at..@end_at)
      .group(:mode)
      .count
    render json: {
      up: count['up'],
      down: count['down'],
      total: (count['up'] || 0) + (count['down'] || 0)
    }
  end

  def votes_by_topic_serie
    votes = StatVotePolicy::Scope.new(current_user, Vote).resolve
      .where(votable_type: 'Idea')
      .joins('JOIN ideas ON ideas.id = votes.votable_id')

    votes = apply_group_filter(votes)
    votes = apply_project_filter(votes)

    votes
      .where(created_at: @start_at..@end_at)
      .joins('JOIN ideas_topics ON ideas_topics.idea_id = ideas.id')
      .group('ideas_topics.topic_id')
      .order('ideas_topics.topic_id')
      .count
  end

  def votes_by_topic
    serie = votes_by_topic_serie
    topics = Topic.all.select(:id, :title_multiloc)
    render json: raw_json({ series: { total: serie }, topics: topics.to_h { |t| [t.id, t.attributes.except('id')] } })
  end

  def votes_by_topic_as_xlsx
    serie = votes_by_topic_serie
    topics = Topic.where(id: serie.keys).select(:id, :title_multiloc)
    res = serie.map do |topic_id, count|
      {
        'topic' => @@multiloc_service.t(topics.find(topic_id).title_multiloc),
        'topic_id' => topic_id,
        'votes' => count
      }
    end

    xlsx = XlsxService.new.generate_res_stats_xlsx res, 'votes', 'topic'

    send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'votes_by_topic.xlsx'
  end

  def votes_by_project_serie
    votes = StatVotePolicy::Scope.new(current_user, Vote).resolve
      .where(votable_type: 'Idea')
      .joins('JOIN ideas ON ideas.id = votes.votable_id')

    votes = apply_group_filter(votes)
    votes = apply_topic_filter(votes)

    votes
      .where(created_at: @start_at..@end_at)
      .group('ideas.project_id')
      .order('ideas.project_id')
      .count
  end

  def votes_by_project
    serie = votes_by_project_serie
    projects = Project.where(id: serie.keys).select(:id, :title_multiloc)
    render json: raw_json({ series: { total: serie }, projects: projects.to_h { |p| [p.id, p.attributes.except('id')] } })
  end

  def votes_by_project_as_xlsx
    serie = votes_by_project_serie
    projects = Project.where(id: serie.keys).select(:id, :title_multiloc)
    res = serie.map do |project_id, count|
      {
        'project' => @@multiloc_service.t(projects.find(project_id).title_multiloc),
        'project_id' => project_id,
        'votes' => count
      }
    end

    xlsx = XlsxService.new.generate_res_stats_xlsx res, 'votes', 'project'

    send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'votes_by_project.xlsx'
  end

  private

  def apply_group_filter(votes)
    if params[:group]
      group = Group.find(params[:group])
      votes.where(user_id: group.members)
    else
      votes
    end
  end

  def apply_project_filter(votes)
    if params[:project]
      votes.where(ideas: { project_id: params[:project] })
    else
      votes
    end
  end

  def apply_topic_filter(votes)
    if params[:topic]
      votes
        .joins('JOIN ideas_topics ON ideas.id = ideas_topics.idea_id')
        .where(ideas_topics: { topic_id: params[:topic] })
    else
      votes
    end
  end

  def do_authorize
    authorize :stat_vote
  end
end
