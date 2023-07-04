# frozen_string_literal: true

class SideFxBasketService
  include SideFxHelper

  def after_create(basket, user)
    LogActivityJob.perform_later(basket, 'created', user, basket.created_at.to_i)
    basket.update_counts! unless basket.submitted_at.nil?
  end

  def after_update(basket, user)
    LogActivityJob.perform_later(basket, 'changed', user, basket.updated_at.to_i)
    basket.update_counts! if basket.submitted_at_previously_changed?
  end

  def after_destroy(frozen_basket, user)
    serialized_basket = clean_time_attributes(frozen_basket.attributes)
    LogActivityJob.perform_later(
      encode_frozen_resource(frozen_basket), 'deleted',
      user, Time.now.to_i,
      payload: { basket: serialized_basket }
    )
    frozen_basket.update_counts!
  end
end
