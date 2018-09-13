class SideFxBasketService

  include SideFxHelper

  def after_create basket, user
    LogActivityJob.perform_later(basket, 'created', user, basket.created_at.to_i)
  end

  def after_update basket, user
    LogActivityJob.perform_later(basket, 'changed', user, basket.updated_at.to_i)
  end

  def after_destroy frozen_basket, user
    serialized_basket = clean_time_attributes(frozen_basket.attributes)
    LogActivityJob.perform_later(
      encode_frozen_resource(frozen_basket), 'deleted',
      user, Time.now.to_i, 
      payload: {basket: serialized_basket}
    )
  end

end
