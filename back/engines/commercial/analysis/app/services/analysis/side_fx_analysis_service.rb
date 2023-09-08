# frozen_string_literal: true

module Analysis
  class SideFxAnalysisService
    include SideFxHelper

    def after_create(analysis, user)
      LogActivityJob.perform_later(analysis, 'created', user, analysis.created_at.to_i)
      create_example_tags(analysis)
    end

    def after_destroy(frozen_analysis, user)
      serialized_analysis = clean_time_attributes(frozen_analysis.attributes)
      LogActivityJob.perform_later(encode_frozen_resource(frozen_analysis), 'deleted', user, Time.now.to_i, payload: { analysis: serialized_analysis })
    end

    private

    def create_example_tags(analysis)
      analysis.tags.create!(
        name: I18n.t('analysis.example_tag_n', n: 1),
        tag_type: 'onboarding_example'
      )
      analysis.tags.create!(
        name: I18n.t('analysis.example_tag_n', n: 2),
        tag_type: 'onboarding_example'
      )
    end
  end
end
