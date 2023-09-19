# frozen_string_literal: true

module Analysis
  class SideFxTaggingService
    include SideFxHelper

    def after_create(tagging, user)
      LogActivityJob.perform_later(tagging, 'created', user, Time.now.to_i)
    end

    def after_destroy(frozen_tagging, user)
      serialized_tagging = clean_time_attributes(frozen_tagging.attributes)
      LogActivityJob.perform_later(encode_frozen_resource(frozen_tagging), 'deleted', user, Time.now.to_i, payload: { tagging: serialized_tagging })
    end
  end
end
