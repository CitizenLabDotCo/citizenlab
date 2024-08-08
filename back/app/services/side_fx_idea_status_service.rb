# frozen_string_literal: true

class SideFxIdeaStatusService
  include SideFxHelper

  def after_create(idea_status, user)
    LogActivityJob.perform_later(idea_status, 'created', user, idea_status.created_at.to_i)
  end

  def after_update(idea_status, user)
    LogActivityJob.perform_later(idea_status, 'changed', user, idea_status.updated_at.to_i)
  end

  def after_destroy(frozen_idea_status, user)
    serialized_idea_status = clean_time_attributes(frozen_idea_status.attributes)
    LogActivityJob.perform_later(encode_frozen_resource(frozen_idea_status), 'deleted', user, Time.now.to_i, payload: { idea_status: serialized_idea_status })
  end
end
