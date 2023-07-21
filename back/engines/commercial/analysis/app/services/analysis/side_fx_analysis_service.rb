# frozen_string_literal: true

module Analysis
  class SideFxAnalysisService
    include SideFxHelper

    def after_create(analysis, user)
      LogActivityJob.perform_later(analysis, 'created', user, analysis.created_at.to_i)
    end

    def after_destroy(frozen_analysis, user)
      serialized_analysis = clean_time_attributes(frozen_analysis.attributes)
      LogActivityJob.perform_later(encode_frozen_resource(frozen_analysis), 'deleted', user, Time.now.to_i, payload: { analysis: serialized_analysis })
    end
  end
end
