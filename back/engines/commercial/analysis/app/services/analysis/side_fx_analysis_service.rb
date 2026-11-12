# frozen_string_literal: true

module Analysis
  class SideFxAnalysisService
    include SideFxHelper

    def before_create(analysis, _user)
      analysis.additional_custom_field_ids = fallback_custom_fields(analysis) if analysis.associated_custom_fields.blank?
    end

    def after_create(analysis, user)
      LogActivityJob.perform_later(analysis, 'created', user, analysis.created_at.to_i)
      HeatmapGenerationJob.perform_later(analysis)
      create_example_tags(analysis)
    end

    def after_update(analysis, user)
      LogActivityJob.perform_later(analysis, 'changed', user, analysis.updated_at.to_i)
      HeatmapGenerationJob.perform_later(analysis)
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
      context = analysis.participation_context
      custom_form = context.custom_form

      if !custom_form
        context.pmethod.create_default_form!
        context.reload # Necessary to find back the created custom form
        custom_form = context.custom_form
      elsif !custom_form.custom_fields.exists?
        persist_default_fields!(context.pmethod, custom_form)
      end

      custom_fields = IdeaCustomFieldsService.new(custom_form).all_fields
      # custom fields can be an array or a scope
      custom_fields.filter(&:supports_free_text_value?).map(&:id)
    end

    def persist_default_fields!(pmethod, custom_form)
      ActiveRecord::Base.transaction do
        pmethod.default_fields(custom_form).each(&:save!)
      end
      custom_form.custom_fields.reload
    end
  end
end
