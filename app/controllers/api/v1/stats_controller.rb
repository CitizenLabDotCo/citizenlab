class Api::V1::StatsController < ApplicationController

  before_action :do_authorize

  @@stats_service = StatsService.new
  def users_by_time
    serie = @@stats_service.group_by_time(User, 'created_at', params[:start_at], params[:end_at], params[:interval])
    render json: serie
  end

  def users_by_gender
    serie = User
      .group("demographics->'gender'")
      .order("demographics->'gender'")
      .count
    serie['_blank'] = serie.delete nil
    render json: serie
  end

  def users_by_birthyear
    serie = User
      .group("demographics->'birthyear'")
      .order("demographics->'birthyear'")
      .count
    serie['_blank'] = serie.delete nil
    render json: serie
  end

  def users_by_domicile
    serie = User
      .group("demographics->'domicile'")
      .order("demographics->'domicile'")
      .count
    serie['_blank'] = serie.delete nil
    render json: serie
  end

  def users_by_education
    serie = User
      .group("demographics->'education'")
      .order("demographics->'education'")
      .count
    serie['_blank'] = serie.delete nil
    render json: serie
  end

  def ideas_by_topic
    serie = Idea
      .joins(:ideas_topics)
      .group("ideas_topics.topic_id")
      .order("ideas_topics.topic_id")
      .count
    render json: serie
  end

  def ideas_by_area
    serie = Idea
      .joins(:areas_ideas)
      .group("areas_ideas.area_id")
      .order("areas_ideas.area_id")
      .count
    render json: serie
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
