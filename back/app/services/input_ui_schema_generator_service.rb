# frozen_string_literal: true

class InputUiSchemaGeneratorService < InputUiSchemaGeneratorService
  def fields_to_ui_schema(fields, locale)
    project = fields.first.resource.project
    input_term = ParticipationContextService.new.get_participation_context(project)&.input_term || 'idea'

    {
      type: 'Categorization',
      options: {
        formId: 'idea-form',
        inputTerm: input_term
      },
      elements: drop_empty_categories([
        {
          type: 'Category',
          label: I18n.t("custom_forms.categories.main_content.#{input_term}.title", locale: locale),
          options: { id: 'mainContent' },
          elements: [
            visit_or_filter(fields.find { |f| f.code == 'title_multiloc' }),
            visit_or_filter(fields.find { |f| f.code == 'author_id' }),
            visit_or_filter(fields.find { |f| f.code == 'body_multiloc' })
          ].compact
        },
        {
          type: 'Category',
          options: { id: 'details' },
          label: I18n.t('custom_forms.categories.details.title', locale: locale),
          elements: [
            visit_or_filter(fields.find { |f| f.code == 'proposed_budget' }),
            visit_or_filter(fields.find { |f| f.code == 'budget' }),
            visit_or_filter(fields.find { |f| f.code == 'topic_ids' }),
            visit_or_filter(fields.find { |f| f.code == 'location_description' })
          ].compact
        },
        {
          type: 'Category',
          label: I18n.t('custom_forms.categories.attachements.title', locale: locale),
          options: { id: 'attachments' },
          elements: [
            visit_or_filter(fields.find { |f| f.code == 'idea_images_attributes' }),
            visit_or_filter(fields.find { |f| f.code == 'idea_files_attributes' })
          ].compact
        },
        {
          type: 'Category',
          options: { id: 'extra' },
          label: I18n.t('custom_forms.categories.extra.title', locale: locale),
          elements: fields.reject(&:built_in?).map { |field| visit_or_filter field }
        }
      ].compact)
    }
  end
end
