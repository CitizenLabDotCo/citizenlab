class SideFxBasketService

  include SideFxHelper

  def after_create basket, user
    LogActivityJob.perform_later(basket, 'created', user, basket.created_at.to_i)
    update_basket_counts
  end

  def after_update basket, user
    LogActivityJob.perform_later(basket, 'changed', user, basket.updated_at.to_i)
    update_basket_counts if basket.submitted_at_previously_changed?
  end

  def after_destroy frozen_basket, user
    serialized_basket = clean_time_attributes(frozen_basket.attributes)
    LogActivityJob.perform_later(
      encode_frozen_resource(frozen_basket), 'deleted',
      user, Time.now.to_i, 
      payload: {basket: serialized_basket}
    )
  end

  def update_basket_counts
    baskets_counts = BasketsIdea
      .left_outer_joins(:basket).where.not(baskets: {submitted_at: nil})
      .group(:idea_id).count
    update_hash = baskets_counts.map do |id, count|
      [id, {baskets_count: count}]
    end.to_h
    Idea.update(update_hash.keys, update_hash.values)
    Idea.where(id: (Idea.ids - baskets_counts.keys)).in_batches.update_all(baskets_count: 0)
  end

end
