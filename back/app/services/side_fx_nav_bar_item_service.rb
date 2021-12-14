class SideFxNavBarItemService
  include SideFxHelper

  def before_create(item, user); end

  def after_create(item, user)
    NavBarItemService.new.auto_reposition! item
    LogActivityJob.perform_later item, 'created', user, item.created_at.to_i
  end

  def before_update(item, user); end

  def after_update(item, user)
    LogActivityJob.perform_later item, 'changed', user, item.updated_at.to_i
  end

  def before_destroy(item, user); end

  def after_destroy(frozen_item, user)
    serialized_item = clean_time_attributes frozen_item.attributes
    encoded_item = encode_frozen_resource frozen_item
    payload = { nav_bar_item: serialized_item }
    LogActivityJob.perform_later encoded_item, 'deleted', user, Time.now.to_i, payload: payload
  end
end
