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
    fields = CustomField.where(id: fields).includes(source_logics: [:target_field], target_logics: [:source_field]) # TODO: This gives issues with built-in fields
    uses_pages = fields.any?(&:page?)
    return super(fields) unless uses_pages

    ui_schema = generate_with_pages(fields)
    add_logic_rules ui_schema, fields
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
    current_page_schema = nil
    current_page_index = 0
    fields.each_with_object([]) do |field, accu|
      field_schema = visit field
      if field.page?
        current_page_index += 1
        field_schema[:options][:id] = "page_#{current_page_index}"
        accu << field_schema
        current_page_schema = field_schema
      elsif current_page_schema
        current_page_schema[:elements] << field_schema
      else
        accu << field_schema
      end
    end
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

  def add_logic_rules(ui_schema, fields)
    ordered_pages = fields.select(&:page?).sort_by(&:ordering)
    ui_schema.tap do |schema|
      schema.each_value do |locale_schema|
        page_elements = locale_schema[:elements].select do |element|
          element[:type] == 'Page'
        end
        page_elements.each do |page_element|
          page_index = page_element.dig(:options, :id).split('_').last.to_i - 1
          page_field = ordered_pages[page_index]
          next if page_field.target_logics.empty?

          page_element[:ruleArray] = page_field.target_logics.map do |logic|
            {
              effect: logic.action,
              condition: {
                scope: "#/properties/#{logic.source_field.key}",
                schema: logic.ui_schema_rule
              }
            }
          end
        end
      end
    end
  end
end
