module Volunteering
  class SideFxCauseService
    include SideFxHelper

    def before_create cause, user
    end

    def after_create cause, user
      LogActivityJob.perform_later(cause, 'created', user, cause.created_at.to_i)
    end

    def before_update cause, user
    end

    def after_update cause, user
      LogActivityJob.perform_later(cause, 'changed', user, cause.updated_at.to_i)
    end

    def before_destroy cause, user
    end

    def after_destroy frozen_cause, user
      serialized_cause = clean_time_attributes(frozen_cause.attributes)
      LogActivityJob.perform_later(encode_frozen_resource(frozen_cause), 'deleted', user, Time.now.to_i, payload: {cause: serialized_cause})
    end
  end
end
