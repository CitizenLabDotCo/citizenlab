# frozen_string_literal: true

class SideFxBasketsIdeaService
  include SideFxHelper

  def before_create(_baskets_idea, _user); end

  def after_create(baskets_idea, user)
    LogActivityJob.perform_later baskets_idea, 'created', user, baskets_idea.created_at.to_i
  end

  def before_update(_baskets_idea, _user); end

  def after_update(baskets_idea, user)
    LogActivityJob.perform_later baskets_idea, 'changed', user, baskets_idea.updated_at.to_i
  end

  def before_destroy(_baskets_idea, _user); end

  def after_destroy(frozen_baskets_idea, user)
    serialized_baskets_idea = clean_time_attributes frozen_baskets_idea.attributes
    LogActivityJob.perform_later(
      encode_frozen_resource(frozen_baskets_idea), 'deleted',
      user, Time.now.to_i,
      payload: { basket: serialized_baskets_idea }
    )
  end
end
