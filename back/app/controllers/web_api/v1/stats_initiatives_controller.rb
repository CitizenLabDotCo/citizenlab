class WebApi::V1::StatsInitiativesController < WebApi::V1::StatsController

  before_action :render_no_data, only: [
    :initiatives_by_time,
    :initiatives_by_time_cumulative,
  ]

  def initiatives_count
    initiatives = StatInitiativePolicy::Scope.new(current_user, Initiative.published).resolve
      .where(published_at: @start_at..@end_at)
    initiatives = PostsFilteringService.new.apply_common_initiative_index_filters initiatives, params

    render json: { count: initiatives.count }
  end

  def initiatives_by_topic
    initiatives = StatInitiativePolicy::Scope.new(current_user, Initiative.published).resolve

    initiatives = apply_group_filter(initiatives)
    initiatives = apply_feedback_needed_filter(initiatives)

    serie = initiatives
      .where(published_at: @start_at..@end_at)
      .joins(:initiatives_topics)
      .group("initiatives_topics.topic_id")
      .order("initiatives_topics.topic_id")
      .count

    topics = Topic.where(id: serie.keys).select(:id, :title_multiloc)
    render json: {series: {initiatives: serie}, topics: topics.map{|t| [t.id, t.attributes.except('id')]}.to_h}
  end

  def initiatives_by_area
    initiatives = StatInitiativePolicy::Scope.new(current_user, Initiative.published).resolve

    initiatives = apply_group_filter(initiatives)
    initiatives = apply_topic_filter(initiatives)
    initiatives = apply_feedback_needed_filter(initiatives)

    serie = initiatives
      .where(published_at: @start_at..@end_at)
      .joins(:areas_initiatives)
      .group("areas_initiatives.area_id")
      .order("areas_initiatives.area_id")
      .count
    areas = Area.where(id: serie.keys).select(:id, :title_multiloc)
    render json: {series: {initiatives: serie}, areas: areas.map{|a| [a.id, a.attributes.except('id')]}.to_h}
  end

  def initiatives_by_time
    initiatives = StatInitiativePolicy::Scope.new(current_user, Initiative.published).resolve

    initiatives = apply_group_filter(initiatives)
    initiatives = apply_topic_filter(initiatives)
    initiatives = apply_feedback_needed_filter(initiatives)

    serie = @@stats_service.group_by_time(
      initiatives,
      'published_at',
      @start_at,
      @end_at,
      params[:interval]
    )
    render json: {series: {initiatives: serie}}
  end

  def initiatives_by_time_cumulative
    initiatives = StatInitiativePolicy::Scope.new(current_user, Initiative.published).resolve

    initiatives = apply_group_filter(initiatives)
    initiatives = apply_topic_filter(initiatives)
    initiatives = apply_feedback_needed_filter(initiatives)

    serie = @@stats_service.group_by_time_cumulative(
      initiatives,
      'published_at',
      @start_at,
      @end_at,
      params[:interval]
    )
    render json: {series: {initiatives: serie}}
  end


  private

  def apply_group_filter initiatives
    if params[:group]
      group = Group.find(params[:group])
      initiatives.joins(:author).where(author: group.members)
    else
      initiatives
    end
  end

  def apply_topic_filter initiatives
    if params[:topic]
      initiatives.with_some_topics([params[:topic]])
    else
      initiatives
    end
  end

  def apply_feedback_needed_filter initiatives
    if params[:feedback_needed].present?
      initiatives.feedback_needed
    else
      initiatives
    end
  end

  def render_no_data
    if @no_data
      render json: {series: {initiatives: {}}}
    end
  end

  def do_authorize
    authorize :stat_initiative
  end
end