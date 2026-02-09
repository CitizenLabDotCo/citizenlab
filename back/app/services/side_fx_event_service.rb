# frozen_string_literal: true

class SideFxEventService
  include SideFxHelper

  def before_create(event, current_user); end

  def after_create(event, current_user)
    LogActivityJob.perform_later(event, 'created', current_user, event.created_at.to_i)
  end

  def after_update(event, current_user)
    LogActivityJob.perform_later(event, 'changed', current_user, event.updated_at.to_i)
  end

  def before_destroy(event, current_user); end

  def after_destroy(frozen_event, current_user)
    serialized_event = clean_time_attributes(frozen_event.attributes)
    LogActivityJob.perform_later(
      encode_frozen_resource(frozen_event),
      'deleted',
      current_user,
      Time.now.to_i,
      payload: { event: serialized_event }
    )
  end

  def after_attendees_xlsx(event, current_user)
    LogActivityJob.perform_later(event, 'exported_attendees', current_user, Time.now.to_i)
  end
end
