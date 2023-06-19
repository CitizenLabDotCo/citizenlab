# frozen_string_literal: true

class SortByParams
  DEFAULT_IDEA_SORT = 'random'

  def sort_ideas(scope, params, current_user)
    case params[:sort] || DEFAULT_IDEA_SORT
    when 'random' then scope.order_random(current_user)
    when 'new' then scope.order_new(:desc)
    when '-new' then scope.order_new(:asc)
    when 'popular' then scope.order_popular(:desc)
    when '-popular' then scope.order_popular(:asc)
    when 'author_name' then scope.order_author_name(:desc)
    when '-author_name' then scope.order_author_name(:asc)
    when 'status' then scope.order(order_status: :desc)
    when '-status' then scope.order(order_status: :asc)
    when 'trending'
      ids = TrendingIdeaService.new.sort_trending(scope).map(&:id)
      Idea.unscoped.where(id: ids).order_as_specified(id: ids)
    when '-trending'
      ids = TrendingIdeaService.new.sort_trending(scope).map(&:id).reverse
      Idea.unscoped.where(id: ids).order_as_specified(id: ids)
    when 'upvotes_count' then scope.order(upvotes_count: :desc)
    when '-upvotes_count' then scope.order(upvotes_count: :asc)
    when 'downvotes_count' then scope.order(downvotes_count: :desc)
    when '-downvotes_count' then scope.order(downvotes_count: :asc)
    when 'baskets_count' then scope.order(baskets_count: :desc)
    when '-baskets_count' then scope.order(baskets_count: :asc)
    else
      raise "Unsupported sorting parameter #{params[:sort]}"
    end
  end
end
