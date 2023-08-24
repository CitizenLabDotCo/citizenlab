# frozen_string_literal: true

module Analysis
  class SideFxSummaryService
    include SideFxHelper

    def after_create(summary, user)
      LogActivityJob.perform_later(summary, 'created', user, summary.created_at.to_i)
    end

    def after_destroy(frozen_summary, user)
      serialized_summary = clean_time_attributes(frozen_summary.attributes)
      LogActivityJob.perform_later(encode_frozen_resource(frozen_summary), 'deleted', user, Time.now.to_i, payload: { summary: serialized_summary })
    end
  end
end
