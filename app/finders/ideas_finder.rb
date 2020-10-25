class IdeasFinder < ApplicationFinder
  default_sort :trending
  sortable_attributes :upvotes_count, :downvotes_count, :baskets_count

  # rubocop:disable Layout/HashAlignment
  sort_scopes(
    'new'           => :order_new,
    '-new'          => { order_new: :asc },
    'trending'      => proc { |ideas| TrendingIdeaService.new.sort_trending(ideas) },
    '-trending'     => proc { |ideas| TrendingIdeaService.new.sort_trending(ideas).reverse },
    'popular'       => :order_popular,
    '-popular'      => { order_popular: :asc },
    'author_name'   => proc { |ideas| ideas.order('users.first_name ASC', 'users.last_name ASC') },
    '-author_name'  => proc { |ideas| ideas.order('users.first_name DESC', 'users.last_name DESC') },
    'status'        => :order_status,
    '-status'       => { order_status: :asc },
    'random'        => :order_random
  )
  # rubocop:enable Layout/HashAlignment
end
