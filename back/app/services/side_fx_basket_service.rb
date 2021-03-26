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
    query =
    """
      UPDATE ideas
      SET baskets_count = counts.count
      FROM (
        SELECT ideas.id as idea_id, count(submitted_baskets.id) as count
        FROM ideas
          LEFT OUTER JOIN baskets_ideas ON ideas.id = baskets_ideas.idea_id
          LEFT OUTER JOIN (SELECT * FROM baskets WHERE submitted_at IS NOT NULL) as submitted_baskets ON baskets_ideas.basket_id = submitted_baskets.id
        GROUP BY ideas.id
      ) as counts
      WHERE ideas.id = counts.idea_id
    """
    ActiveRecord::Base.connection.execute(query)
  end
end