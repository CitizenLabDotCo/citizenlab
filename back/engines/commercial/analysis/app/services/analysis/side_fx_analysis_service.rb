# frozen_string_literal: true

module Analysis
  class SideFxAnalysisService
    include SideFxHelper

    def before_create(analysis, user)
      analysis.additional_custom_field_ids = fallback_custom_fields(analysis) if analysis.associated_custom_fields.blank?
    end

    def after_create(analysis, user)
      LogActivityJob.perform_later(analysis, 'created', user, analysis.created_at.to_i)
      create_example_tags(analysis)
    end

    def after_update(analysis, user)
      LogActivityJob.perform_later(analysis, 'changed', user, analysis.updated_at.to_i)
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

    def fallback_custom_fields(analysis)
      participation_method = Factory.instance.participation_method_for(analysis.participation_context)
      custom_form = analysis.participation_context.custom_form || participation_method.create_default_form!

      custom_fields = IdeaCustomFieldsService.new(custom_form).all_fields
      # custom fields can be an array or a scope
      custom_fields.filter(&:support_free_text_value?).map(&:id)
    end
  end
end
