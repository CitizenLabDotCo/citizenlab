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

  def generate_for(fields)
    uses_pages = fields.any?(&:page?)
    return super(fields) unless uses_pages

    generate_with_pages(fields)
  end

  def visit_page(field)
    {
      type: 'Page',
      options: {
        # No id yet. It will be set after invoking this method.
        title: multiloc_service.t(field.title_multiloc),
        description: description_option(field)
      },
      elements: [
        # No elements yet. They will be added after invoking this method.
      ]
    }
  end

  protected

  def default_options(field)
    super.merge(isAdminField: admin_field?(field)).tap do |options|
      options[:description] = description_option field
    end
  end

  def description_option(field)
    @descriptions ||= {}
    @descriptions[field] ||= multiloc_service.t TextImageService.new.render_data_images(field, :description_multiloc)
  end

  def generate_with_pages(fields)
    locales.index_with do |locale|
      I18n.with_locale(locale) do
        generate_pages_for_current_locale fields
      end
    end
  end

  def schema_elements_for(fields)
    form_logic = FormLogicService.new(fields)
    current_page_schema = nil
    current_page_index = 0
    field_schemas = []
    fields.each do |field|
      field_schema = visit field
      if field.page?
        current_page_index += 1
        field_schema[:options][:id] = "page_#{current_page_index}"
        rules = form_logic.ui_schema_rules_for(field)
        field_schema[:ruleArray] = rules if rules.present?
        field_schemas << field_schema
        current_page_schema = field_schema
      elsif current_page_schema
        current_page_schema[:elements] << field_schema
      else
        field_schemas << field_schema
      end
    end
    field_schemas << end_page_schema
    field_schemas
  end

  def end_page_schema
    {
      type: 'Page',
      options: {
        id: 'survey_end',
        title: I18n.t('form_builder.survey_end_page.title'),
        description: I18n.t('form_builder.survey_end_page.description')
      },
      elements: []
    }
  end

  def categorization_schema_with(input_term, elements)
    {
      type: 'Categorization',
      options: {
        formId: 'idea-form',
        inputTerm: input_term
      },
      elements: elements
    }
  end

  def generate_pages_for_current_locale(fields)
    participation_context = fields.first.resource.participation_context
    input_term = participation_context.input_term || ParticipationContext::DEFAULT_INPUT_TERM
    categorization_schema_with(input_term, schema_elements_for(fields))
  end

  def generate_for_current_locale(fields)
    participation_context = fields.first.resource.participation_context
    participation_method = Factory.instance.participation_method_for participation_context
    input_term = participation_context.input_term || ParticipationContext::DEFAULT_INPUT_TERM
    built_in_field_index = fields.select(&:built_in?).index_by(&:code)
    main_fields = built_in_field_index.slice('title_multiloc', 'author_id', 'body_multiloc').values
    details_fields = built_in_field_index.slice('proposed_budget', 'budget', 'topic_ids', 'location_description').values
    attachments_fields = built_in_field_index.slice('idea_images_attributes', 'idea_files_attributes').values
    custom_fields = fields.reject(&:built_in?)

    elements = [
      category_for(main_fields, 'mainContent', "custom_forms.categories.main_content.#{input_term}.title"),
      category_for(details_fields, 'details', 'custom_forms.categories.details.title'),
      category_for(attachments_fields, 'attachments', 'custom_forms.categories.attachements.title'),
      category_for(custom_fields, 'extra', participation_method.extra_fields_category_translation_key)
    ].compact
    categorization_schema_with(input_term, elements)
  end

  private

  def admin_field?(field)
    field.code == 'budget' || field.code == 'author_id'
  end

  def category_for(fields, category_id, translation_key)
    return if fields.empty?

    {
      type: 'Category',
      label: (I18n.t(translation_key) if translation_key),
      options: { id: category_id },
      elements: fields.filter_map { |field| visit field }
    }
  end
end
