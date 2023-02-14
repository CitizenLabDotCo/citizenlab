# frozen_string_literal: true

class InputUiSchemaGeneratorService < UiSchemaGeneratorService
  def initialize(input_term, supports_answer_visible_to)
    super()
    @input_term = input_term || ParticipationContext::DEFAULT_INPUT_TERM
    @supports_answer_visible_to = supports_answer_visible_to
  end

  def visit_html_multiloc(field)
    super.tap do |ui_field|
      if field.code == 'body_multiloc'
        ui_field[:elements].each do |element|
          element[:options].delete :trim_on_blur
        end
      end
    end
  end

  def generate_for(fields)
    uses_pages = fields.any?(&:page?)
    return super(fields) unless uses_pages

    generate_with_pages(fields)
  end

  def visit_topic_ids(field)
    default field
  end

  def visit_page(field)
    {
      type: 'Page',
      options: {
        input_type: field.input_type,
        id: field.id,
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
    defaults = {
      isAdminField: admin_field?(field),
      hasRule: field.logic?
    }
    if @supports_answer_visible_to
      defaults[:answer_visible_to] = field.answer_visible_to
    end
    super.merge(defaults).tap do |options|
      options[:description] = description_option field
    end
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
    field_schemas = []
    fields.each do |field|
      field_schema = visit field
      if field.page?
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
    # Case for native surveys
    return generate_for_current_locale_without_sections fields if fields.none?(&:section?)

    current_section = nil
    section_fields = []
    elements = []
    fields.each do |field|
      if field.section?
        elements += [generate_section(current_section, section_fields)] if current_section
        current_section = field
        section_fields = []
      else
        section_fields += [field]
      end
    end
    elements += [generate_section(current_section, section_fields)] if current_section
    categorization_schema_with input_term, elements
  end

  def generate_section(current_section, section_fields)
    {
      type: 'Category',
      label: (MultilocService.new.t(current_section.title_multiloc) if current_section.title_multiloc),
      options: { id: current_section.id, description: description_option(current_section) },
      elements: section_fields.filter_map { |field| visit field }
    }
  end

  def generate_for_current_locale_without_sections(fields)
    category = {
      type: 'Category',
      label: nil,
      options: { id: 'extra' },
      elements: fields.filter_map { |field| visit field }
    }
    categorization_schema_with(input_term, [category])
  end

  private

  attr_reader :input_term

  def admin_field?(field)
    field.code == 'budget' || field.code == 'author_id'
  end
end
