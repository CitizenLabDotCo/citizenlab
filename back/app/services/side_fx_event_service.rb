class SideFxEventService
  include SideFxHelper

  def before_create event, current_user; end

  def after_create event, current_user
    event.update!(description_multiloc: TextImageService.new.swap_data_images(event, :description_multiloc))
    LogActivityService.new.run(event, "created", current_user, event.created_at.to_i)
  end

  def before_update event, current_user
    event.description_multiloc = TextImageService.new.swap_data_images(event, :description_multiloc)
  end

  def after_update event, current_user
    LogActivityService.new.run(event, 'changed', current_user, event.updated_at.to_i)
  end

  def before_destroy event, current_user

  end

  def after_destroy frozen_event, current_user
    serialized_event = clean_time_attributes(frozen_event.attributes)
    LogActivityService.new.run(
      encode_frozen_resource(frozen_event), 
      "deleted", 
      current_user, 
      Time.now.to_i, 
      payload: {event: serialized_event}
    )
  end
end