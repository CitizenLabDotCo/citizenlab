class WebApi::V1::StatsController < ApplicationController

  before_action :do_authorize

  @@stats_service = StatsService.new
  def users_by_time
    serie = @@stats_service.group_by_time(User, 'created_at', params[:start_at], params[:end_at], params[:interval])
    render json: serie
  end

  def users_by_gender
    serie = User
      .where(created_at: params[:start_at]..params[:end_at])
      .group("custom_field_values->'gender'")
      .order("custom_field_values->'gender'")
      .count
    serie['_blank'] = serie.delete(nil) || 0
    render json: serie
  end

  def users_by_birthyear
    serie = User
      .where(created_at: params[:start_at]..params[:end_at])
      .group("custom_field_values->'birthyear'")
      .order("custom_field_values->'birthyear'")
      .count
    serie['_blank'] = serie.delete(nil) || 0
    render json: serie
  end

  def users_by_domicile
    serie = User
      .where(created_at: params[:start_at]..params[:end_at])
      .group("custom_field_values->'domicile'")
      .order("custom_field_values->'domicile'")
      .count
    serie['_blank'] = serie.delete(nil) || 0
    areas = Area.where(id: serie.keys).select(:id, :title_multiloc)
    render json: {data: serie, areas: areas.map{|a| [a.id, a.attributes.except('id')]}.to_h}
  end

  def users_by_education
    serie = User
      .where(created_at: params[:start_at]..params[:end_at])
      .group("custom_field_values->'education'")
      .order("custom_field_values->'education'")
      .count
    serie['_blank'] = serie.delete(nil) || 0
    render json: serie
  end

  def ideas_by_topic
    serie = Idea
      .where(published_at: params[:start_at]..params[:end_at])
      .joins(:ideas_topics)
      .group("ideas_topics.topic_id")
      .order("ideas_topics.topic_id")
      .count
    topics = Topic.where(id: serie.keys).select(:id, :title_multiloc)
    render json: {data: serie, topics: topics.map{|t| [t.id, t.attributes.except('id')]}.to_h}
  end

  def ideas_by_area
    serie = Idea
      .where(published_at: params[:start_at]..params[:end_at])
      .joins(:areas_ideas)
      .group("areas_ideas.area_id")
      .order("areas_ideas.area_id")
      .count
    areas = Area.where(id: serie.keys).select(:id, :title_multiloc)
    render json: {data: serie, areas: areas.map{|a| [a.id, a.attributes.except('id')]}.to_h}
  end

  def ideas_by_time
    serie = @@stats_service.group_by_time(Idea, 'published_at', params[:start_at], params[:end_at], params[:interval])
    render json: serie
  end

  def comments_by_time
    serie = @@stats_service.group_by_time(Comment, 'created_at', params[:start_at], params[:end_at], params[:interval])
    render json: serie
  end

  def votes_by_time
    serie = @@stats_service.group_by_time(Vote, 'created_at', params[:start_at], params[:end_at], params[:interval])
    render json: serie
  end

  def secure_controller?
    false
  end

  def do_authorize
    authorize :stat
  end
end
