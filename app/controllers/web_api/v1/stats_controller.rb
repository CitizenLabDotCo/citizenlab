class WebApi::V1::StatsController < ApplicationController

  before_action :do_authorize, :parse_time_boundaries

  @@stats_service = StatsService.new

  # ** users ***

  def users_count
    count = User
      .where(registration_completed_at: @start_at..@end_at)
      .active
      .count
    render json: { count: count }
  end

  def users_by_time
    serie = @@stats_service.group_by_time(User.active, 'registration_completed_at', @start_at, @end_at, params[:interval])
    render json: serie
  end

  def users_by_gender
    serie = User
      .active
      .where(created_at: @start_at..@end_at)
      .group("custom_field_values->'gender'")
      .order("custom_field_values->'gender'")
      .count
    serie['_blank'] = serie.delete(nil) || 0
    render json: serie
  end

  def users_by_birthyear
    serie = User
      .active
      .where(created_at: @start_at..@end_at)
      .group("custom_field_values->'birthyear'")
      .order("custom_field_values->'birthyear'")
      .count
    serie['_blank'] = serie.delete(nil) || 0
    render json: serie
  end

  def users_by_domicile
    serie = User
      .active
      .where(created_at: @start_at..@end_at)
      .group("custom_field_values->'domicile'")
      .order("custom_field_values->'domicile'")
      .count
    serie['_blank'] = serie.delete(nil) || 0
    areas = Area.where(id: serie.keys).select(:id, :title_multiloc)
    render json: {data: serie, areas: areas.map{|a| [a.id, a.attributes.except('id')]}.to_h}
  end

  def users_by_education
    serie = User
      .active
      .where(created_at: @start_at..@end_at)
      .group("custom_field_values->'education'")
      .order("custom_field_values->'education'")
      .count
    serie['_blank'] = serie.delete(nil) || 0
    render json: serie
  end

  # # *** ideas ***

  def ideas_count
    count = Idea
      .where(published_at: @start_at..@end_at)
      .published
      .count
      
    render json: { count: count }
  end

  def ideas_by_topic
    serie = Idea
      .where(published_at: @start_at..@end_at)
      .joins(:ideas_topics)
      .group("ideas_topics.topic_id")
      .order("ideas_topics.topic_id")
      .count
    topics = Topic.where(id: serie.keys).select(:id, :title_multiloc)
    render json: {data: serie, topics: topics.map{|t| [t.id, t.attributes.except('id')]}.to_h}
  end

  def ideas_by_area
    serie = Idea
      .where(published_at: @start_at..@end_at)
      .joins(:areas_ideas)
      .group("areas_ideas.area_id")
      .order("areas_ideas.area_id")
      .count
    areas = Area.where(id: serie.keys).select(:id, :title_multiloc)
    render json: {data: serie, areas: areas.map{|a| [a.id, a.attributes.except('id')]}.to_h}
  end

  def ideas_by_time
    serie = @@stats_service.group_by_time(Idea, 'published_at', @start_at, @end_at, params[:interval])
    render json: serie
  end

  # ** comments ***

  def comments_count
    count = Comment
      .where(created_at: @start_at..@end_at)
      .published
      .count
      
    render json: { count: count }
  end

  def comments_by_time
    serie = @@stats_service.group_by_time(Comment, 'created_at', @start_at, @end_at, params[:interval])
    render json: serie
  end

  # *** votes ***

  def votes_count
    count = votes_by_resource
      .where(created_at: @start_at..@end_at)
      .group(:mode)
      .count
    render json: { 
      up: count["up"], 
      down: count["down"], 
      count: (count["up"] || 0) + (count["down"] || 0)
    }
  end

  def votes_by_birthyear
    render json: votes_by_custom_field('birthyear')
  end

  def votes_by_domicile
    render json: votes_by_custom_field('domicile')
  end

  def votes_by_education
    render json: votes_by_custom_field('education')
  end

  def votes_by_gender
    render json: votes_by_custom_field('gender')
  end

  def votes_by_custom_field
    if params[:custom_field]
      render json: votes_by_custom_field(params[:custom_field])
    else
      render json: {422 => :custom_field_blank} # TODO
    end
  end

  def votes_by_time
    serie = @@stats_service.group_by_time(votes_by_resource, 'created_at', @start_at, @end_at, params[:interval])
    render json: serie
  end

  private

  def parse_time_boundaries
    @start_at =  params[:start_at] || -Float::INFINITY
    @end_at = params[:end_at] || Float::INFINITY
  end

  def votes_by_resource
    votes = Vote
    if ['Idea', 'Comment'].include? params[:resource]
      votes = votes.where(votable_type: params[:resource])
    end
    votes
  end

  def apply_idea_filters ideas
    ideas = ideas.where(id: params[:ideas]) if params[:ideas].present?
    ideas = ideas.with_some_topics(params[:topics]) if params[:topics].present?
    ideas = ideas.with_some_areas(params[:areas]) if params[:areas].present?
    ideas = ideas.in_phase(params[:phase]) if params[:phase].present?
    ideas = ideas.where(project_id: params[:project]) if params[:project].present?
    ideas = ideas.where(author_id: params[:author]) if params[:author].present?
    ideas = ideas.where(idea_status_id: params[:idea_status]) if params[:idea_status].present?
    ideas = ideas.search_by_all(params[:search]) if params[:search].present?
    if params[:publication_status].present?
      ideas = ideas.where(publication_status: params[:publication_status])
    else
      ideas = ideas.where(publication_status: 'published')
    end
    if (params[:filter_trending] == 'true') && !params[:search].present?
      ideas = trending_idea_service.filter_trending ideas
    end
    ideas
  end

  def votes_by_custom_field key
    serie = Vote
      .where(votable_type: 'Idea')
      .where(created_at: @start_at..@end_at)
      .where(votable_id: apply_idea_filters(policy_scope(Idea)))
      .left_outer_joins(:user)
      .group("mode","users.custom_field_values->>'#{key}'")
      .order("users.custom_field_values->>'#{key}'")
      .count
    data = %w(up down).map do |mode|
      [
        mode,
        serie.keys.select do |key_mode, _|
          key_mode == mode 
        end.map do |_, value|
          [value, serie[[mode,value]]]
        end.to_h
      ]
    end.to_h
    data['total'] = (data['up'].keys+data['down'].keys).uniq.map do |key|
      [
        key,
        (data.dig('up',key) || 0) + (data.dig('down',key) || 0)
      ]
    end.to_h
    data
  end

  def secure_controller?
    false
  end

  def do_authorize
    authorize :stat
  end

end
