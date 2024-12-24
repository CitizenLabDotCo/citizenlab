# frozen_string_literal: true

class SortByParamsService
  DEFAULT_IDEA_SORT = 'random'
  DEFAULT_INITIATIVE_SORT = 'new'
  DEFAULT_EVENT_SORT = 'start_at'
  DEFAULT_ACTIVITY_SORT = '-acted_at'

  # rubocop:disable Metrics/CyclomaticComplexity
  def sort_ideas(scope, params, current_user)
    case params[:sort] || DEFAULT_IDEA_SORT
    when 'random' then scope.order_random(current_user)
    when 'new' then scope.order_new(:desc)
    when '-new' then scope.order_new(:asc)
    when 'popular' then scope.order_popular(:desc)
    when '-popular' then scope.order_popular(:asc)
    when 'author_name' then scope.order_author_name(:desc)
    when '-author_name' then scope.order_author_name(:asc)
    when 'status' then scope.order_status(:desc)
    when '-status' then scope.order_status(:asc)
    when 'trending'
      ids = TrendingIdeaService.new.sort_trending(scope).map(&:id)
      Idea.unscoped.where(id: ids).order_as_specified(id: ids)
    when '-trending'
      ids = TrendingIdeaService.new.sort_trending(scope).map(&:id).reverse
      Idea.unscoped.where(id: ids).order_as_specified(id: ids)
    when 'likes_count' then scope.order(likes_count: :desc)
    when '-likes_count' then scope.order(likes_count: :asc)
    when 'dislikes_count' then scope.order(dislikes_count: :desc)
    when '-dislikes_count' then scope.order(dislikes_count: :asc)
    when 'baskets_count' then idea_voting_count_sort(scope, 'baskets_count', params[:phase], direction: :desc)
    when '-baskets_count' then idea_voting_count_sort(scope, 'baskets_count', params[:phase])
    when 'votes_count' then idea_voting_count_sort(scope, 'votes_count', params[:phase], direction: :desc)
    when '-votes_count' then idea_voting_count_sort(scope, 'votes_count', params[:phase])
    when 'total_votes' then idea_voting_count_sort(scope, 'votes_count', params[:phase], direction: :desc, add_column: 'manual_votes_amount')
    when '-total_votes' then idea_voting_count_sort(scope, 'votes_count', params[:phase], add_column: 'manual_votes_amount')
    when 'total_baskets' then idea_voting_count_sort(scope, 'baskets_count', params[:phase], direction: :desc, add_column: 'manual_votes_amount')
    when '-total_baskets' then idea_voting_count_sort(scope, 'baskets_count', params[:phase], add_column: 'manual_votes_amount')
    when 'manual_votes_amount' then scope.order(Arel.sql('COALESCE(manual_votes_amount, -1)') => :desc)
    when '-manual_votes_amount' then scope.order(manual_votes_amount: :asc)
    when 'comments_count' then scope.order(comments_count: :desc)
    when '-comments_count' then scope.order(comments_count: :asc)
    when 'budget' then scope.order(budget: :desc)
    when '-budget' then scope.order(budget: :asc)
    else
      raise "Unsupported sorting parameter #{params[:sort]}"
    end
  end
  # rubocop:enable Metrics/CyclomaticComplexity

  def sort_initiatives(scope, params, current_user)
    case params[:sort] || DEFAULT_INITIATIVE_SORT
    when 'random' then scope.order_random(current_user)
    when 'new' then scope.order_new(:desc)
    when '-new' then scope.order_new(:asc)
    when 'author_name' then scope.order_author_name(:desc)
    when '-author_name' then scope.order_author_name(:asc)
    when 'status' then scope.order_status(:desc)
    when '-status' then scope.order_status(:asc)
    when 'likes_count' then scope.order(likes_count: :desc)
    when '-likes_count' then scope.order(likes_count: :asc)
    when 'comments_count' then scope.order(comments_count: :desc)
    when '-comments_count' then scope.order(comments_count: :asc)
    when 'accepted_cosponsorships_count' then scope.order_accepted_cosponsorships(:desc)
    when '-accepted_cosponsorships_count' then scope.order_accepted_cosponsorships(:asc)
    else
      raise "Unsupported sorting parameter #{params[:sort]}"
    end
  end

  def sort_events(scope, params)
    case params[:sort] || DEFAULT_EVENT_SORT
    when 'start_at' then scope.order(start_at: :desc)
    when '-start_at' then scope.order(start_at: :asc)
    else
      raise "Unsupported sorting parameter #{params[:sort]}"
    end
  end

  def sort_activities(scope, params)
    case params[:sort] || DEFAULT_ACTIVITY_SORT
    when 'acted_at' then scope.order(acted_at: :desc)
    when '-acted_at' then scope.order(acted_at: :asc)
    else
      raise "Unsupported sorting parameter #{params[:sort]}"
    end
  end

  private

  def idea_voting_count_sort(scope, sort, phase_id, direction: :asc, add_column: nil)
    if phase_id
      sort_part = add_column ? Arel.sql("ideas_phases.#{sort} + COALESCE(ideas.#{add_column}, 0)") : "ideas_phases.#{sort}"
      scope.left_outer_joins(:ideas_phases).where(ideas_phases: { phase_id: phase_id }).order(sort_part => direction)
    else
      sort_part = add_column ? Arel.sql("#{sort} + COALESCE(#{add_column}, 0)") : sort
      scope.order(sort_part => direction)
    end
  end
end
