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
    count = Vote
      .where(created_at: @start_at..@end_at)
      .group(:mode)
      .count
    render json: { 
      up: count["up"], 
      down: count["down"], 
      count: (count["up"] || 0) + (count["down"] || 0)
    }
  end

  def votes_by_time
    serie = @@stats_service.group_by_time(Vote, 'created_at', @start_at, @end_at, params[:interval])
    render json: serie
  end

  private

  def parse_time_boundaries
    @start_at =  params[:start_at] || -Float::INFINITY
    @end_at = params[:end_at] || Float::INFINITY
  end

  def secure_controller?
    false
  end

  def do_authorize
    authorize :stat
  end
end
