# frozen_string_literal: true

class InputUiSchemaGeneratorService < UiSchemaGeneratorService
  def visit_html_multiloc(field)
    super.tap do |ui_field|
      if field.code == 'body_multiloc'
        ui_field[:elements].each do |elt|
          elt[:options].delete :trim_on_blur
        end
      end
    end
  end

  protected

  def generate_for_current_locale(fields)
    input_term = fields.first.resource.participation_context&.input_term || 'idea'
    built_in_field_index = fields.select(&:built_in?).index_by(&:code)
    main_fields = built_in_field_index.slice('title_multiloc', 'author_id', 'body_multiloc').values
    details_fields = built_in_field_index.slice('proposed_budget', 'budget', 'topic_ids', 'location_description').values
    attachments_fields = built_in_field_index.slice('idea_images_attributes', 'idea_files_attributes').values
    custom_fields = fields.reject(&:built_in?)

    elements = [
      category_for(main_fields, 'mainContent', "custom_forms.categories.main_content.#{input_term}.title"),
      category_for(details_fields, 'details', 'custom_forms.categories.details.title'),
      category_for(attachments_fields, 'attachments', 'custom_forms.categories.attachements.title'),
      category_for(custom_fields, 'extra', 'custom_forms.categories.extra.title')
    ].compact
    {
      type: 'Categorization',
      options: {
        formId: 'idea-form',
        inputTerm: input_term
      },
      elements: elements
    }
  end

  private

  def category_for(fields, category_id, translation_key)
    return if fields.empty?

    {
      type: 'Category',
      label: I18n.t(translation_key),
      options: { id: category_id },
      elements: fields.map { |field| visit field }
    }
  end
end
