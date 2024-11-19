# frozen_string_literal: true

class WebApi::V1::StatsInitiativesController < WebApi::V1::StatsController
  def initiatives_count
    initiatives = policy_scope(Initiative.published).where(published_at: @start_at..@end_at)
    initiatives = PostsFilteringService.new.apply_common_initiative_index_filters initiatives, params

    render json: raw_json({ count: initiatives.count })
  end

  private

  def do_authorize
    authorize :stat_initiative
  end
end
