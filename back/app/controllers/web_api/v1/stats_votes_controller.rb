class WebApi::V1::StatsVotesController < WebApi::V1::StatsController

  before_action :render_no_data, only: [
    :votes_by_time,
    :votes_by_time_cumulative,
  ]
  before_action :render_no_data_as_xlsx, only: [
    :votes_by_time_as_xlsx,
  ]

  @@multiloc_service = MultilocService.new

  def votes_count
    count = StatVotePolicy::Scope.new(current_user, Vote).resolve
      .where(votable_type: 'Idea')
      .where(created_at: @start_at..@end_at)
      .group(:mode)
      .count
    render json: {
      up: count["up"],
      down: count["down"],
      total: (count["up"] || 0) + (count["down"] || 0)
    }
  end

  def votes_by_birthyear
    render json: {series: votes_by_custom_field_key('birthyear', params, params[:normalization] || 'absolute')}
  end

  def votes_by_domicile
    render json: {series: votes_by_custom_field_key('domicile', params, params[:normalization] || 'absolute')}
  end

  def votes_by_education
    render json: {series: votes_by_custom_field_key('education', params, params[:normalization] || 'absolute')}
  end

  def votes_by_gender
    render json: {series: votes_by_custom_field_key('gender', params, params[:normalization] || 'absolute')}
  end

  def votes_by_custom_field
    custom_field = CustomField.find params[:custom_field]
    render json: {series: votes_by_custom_field_key(custom_field.key, params, params[:normalization] || 'absolute')}
  end

  def votes_by_time_serie
    votes = StatVotePolicy::Scope.new(current_user, Vote).resolve
      .where(votable_type: 'Idea')
      .joins("JOIN ideas ON ideas.id = votes.votable_id")

    votes = apply_group_filter(votes)
    votes = apply_project_filter(votes)
    votes = apply_topic_filter(votes)

    serie = @@stats_service.group_by_time(
      votes.group(:mode),
      'votes.created_at',
      @start_at,
      @end_at,
      params[:interval]
    )
  end

  def votes_by_time
    render json: {series: double_grouped_by_to_nested_hashes(votes_by_time_serie)}
  end

  def votes_by_time_as_xlsx
    xlsx = XlsxService.new.generate_votes_by_time_xlsx double_grouped_by_to_object_array(votes_by_time_serie), 'votes_by_time'

    send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: 'votes_by_time.xlsx'
  end

  def votes_by_time_cumulative_serie
    votes = StatVotePolicy::Scope.new(current_user, Vote).resolve
      .where(votable_type: 'Idea')
      .joins("JOIN ideas ON ideas.id = votes.votable_id")

    votes = apply_group_filter(votes)
    votes = apply_project_filter(votes)
    votes = apply_topic_filter(votes)

    serie = @@stats_service.group_by_time_cumulative(
      votes.group(:mode),
      'votes.created_at',
      @start_at,
      @end_at,
      params[:interval]
    )
  end

  def votes_by_time_cumulative
    render json: {series: double_grouped_by_to_nested_hashes(votes_by_time_cumulative_serie)}
  end


  def votes_by_topic_serie
    votes = StatVotePolicy::Scope.new(current_user, Vote).resolve
      .where(votable_type: 'Idea')
      .joins("JOIN ideas ON ideas.id = votes.votable_id")

    votes = apply_group_filter(votes)
    votes = apply_project_filter(votes)

    votes
      .where(created_at: @start_at..@end_at)
      .joins("JOIN ideas_topics ON ideas_topics.idea_id = ideas.id")
      .group("ideas_topics.topic_id")
      .order("ideas_topics.topic_id")
      .count
  end

  def votes_by_topic
    serie = votes_by_topic_serie
    topics = Topic.all.select(:id, :title_multiloc)
    render json: {series: {total: serie}, topics: topics.map{|t| [t.id, t.attributes.except('id')]}.to_h}
  end

  def votes_by_topic_as_xlsx
    serie = votes_by_topic_serie
    topics = Topic.where(id: serie.keys).select(:id, :title_multiloc)
    res = serie.map {|topic_id, count|
      {
        "topic" => @@multiloc_service.t(topics.find(topic_id).title_multiloc),
        "topic_id" => topic_id,
        "votes" => count
      }
    }

    xlsx = XlsxService.new.generate_res_stats_xlsx res, "votes", "topic"

    send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: "votes_by_topic.xlsx"
  end

  def votes_by_project_serie
    votes = StatVotePolicy::Scope.new(current_user, Vote).resolve
      .where(votable_type: 'Idea')
      .joins("JOIN ideas ON ideas.id = votes.votable_id")

    votes = apply_group_filter(votes)
    votes = apply_topic_filter(votes)

    votes
      .where(created_at: @start_at..@end_at)
      .group("ideas.project_id")
      .order("ideas.project_id")
      .count
  end

  def votes_by_project
    serie = votes_by_project_serie
    projects = Project.where(id: serie.keys).select(:id, :title_multiloc)
    render json: {series: {total: serie}, projects: projects.map{|p| [p.id, p.attributes.except('id')]}.to_h}
  end

  def votes_by_project_as_xlsx
    serie = votes_by_project_serie
    projects = Project.where(id: serie.keys).select(:id, :title_multiloc)
    res = serie.map {|project_id, count|
      {
        "project" => @@multiloc_service.t(projects.find(project_id).title_multiloc),
        "project_id" => project_id,
        "votes" => count
      }
    }

    xlsx = XlsxService.new.generate_res_stats_xlsx res, "votes", "project"

    send_data xlsx, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: "votes_by_project.xlsx"
  end

  private

  def apply_group_filter votes
    if params[:group]
      group = Group.find(params[:group])
      votes.where(user_id: group.members)
    else
      votes
    end
  end

  def apply_project_filter votes
    if params[:project]
      votes.where(ideas: {project_id: params[:project]})
    else
      votes
    end
  end

  def apply_topic_filter votes
    if params[:topic]
      votes
        .joins("JOIN ideas_topics ON ideas.id = ideas_topics.idea_id")
        .where(ideas_topics: {topic_id: params[:topic]})
    else
      votes
    end
  end

  def apply_idea_filters ideas, filter_params
    ideas = ideas.where(id: filter_params[:ideas]) if filter_params[:ideas].present?
    ideas = ideas.with_some_topics(filter_params[:topics]) if filter_params[:topics].present?
    ideas = ideas.with_some_areas(filter_params[:areas]) if filter_params[:areas].present?
    ideas = ideas.in_phase(filter_params[:phase]) if filter_params[:phase].present?
    ideas = ideas.where(project_id: filter_params[:project]) if filter_params[:project].present?
    ideas = ideas.where(author_id: filter_params[:author]) if filter_params[:author].present?
    ideas = ideas.where(idea_status_id: filter_params[:idea_status]) if filter_params[:idea_status].present?
    ideas = ideas.search_by_all(filter_params[:search]) if filter_params[:search].present?
    if filter_params[:publication_status].present?
      ideas = ideas.where(publication_status: filter_params[:publication_status])
    else
      ideas = ideas.where(publication_status: 'published')
    end
    if (filter_params[:filter_trending] == 'true') && !filter_params[:search].present?
      ideas = trending_idea_service.filter_trending ideas
    end
    ideas
  end

  def votes_by_custom_field_key key, filter_params, normalization='absolute'
    serie = StatVotePolicy::Scope.new(current_user, Vote).resolve
      .where(votable_type: 'Idea')
      .where(created_at: @start_at..@end_at)
      .where(votable_id: apply_idea_filters(policy_scope(Idea), filter_params))
      .left_outer_joins(:user)
      .group("mode","users.custom_field_values->>'#{key}'")
      .order(Arel.sql("users.custom_field_values->>'#{key}'"))
      .count
    data = %w(up down).map do |mode|
      [
        mode,
        serie.keys.select do |key_mode, _|
          key_mode == mode
        end.map do |_, value|
          [(value || "_blank"), serie[[mode,value]]]
        end.to_h
      ]
    end.to_h
    data['total'] = (data['up'].keys+data['down'].keys).uniq.map do |key|
      [
        key,
        (data.dig('up',key) || 0) + (data.dig('down',key) || 0)
      ]
    end.to_h

    if normalization == 'relative'
      normalize_votes(data, key)
    else
      data
    end
  end

  def double_grouped_by_to_nested_hashes serie
    response = {
      "up" => {},
      "down" => {},
      "total" => Hash.new{|hash,key| hash[key] = 0}
    }
    serie.each_with_object(response) do |((mode, date), count), object|
      object[mode][date] = count
      object["total"][date] += count
    end
  end

  def double_grouped_by_to_object_array serie
    res = []
    serie.each do |((mode, date), count)|
      found_index = res.index {|item| item["date"] == date }
      if found_index
        res[found_index][mode] = count
        res[found_index]["total"] += count
      else
        res.push({
          "date" => date,
          mode => count,
          "total" => count
        })
      end
    end
    res
  end


  def normalize_votes data, key
    normalizing_data = votes_by_custom_field_key(key, {}, 'absolute')
    data.map do |mode, buckets|
      [
        mode,
        buckets.map do |value, number|
          denominator = (normalizing_data.dig('total', value) || 0) + 1
          [value, number.to_f*100/denominator.to_f]
        end.to_h
      ]
    end.to_h
  end

  def render_no_data
    if @no_data
      render json: {series: {up:{}, down: {}, total: {}}}
    end
  end

  def render_no_data_as_xlsx
    if @no_data
      render json: {errors: "no data for this period"}, status: :unprocessable_entity
    end
  end

  def do_authorize
    authorize :stat_vote
  end

end
