# frozen_string_literal: true

class InputUiSchemaGeneratorService < UiSchemaGeneratorService
  def initialize(input_term, supports_answer_visible_to)
    super()
    @input_term = input_term || Phase::FALLBACK_INPUT_TERM
    @supports_answer_visible_to = supports_answer_visible_to
  end

  def visit_html_multiloc(field)
    ui_field = super

    return ui_field unless field.code == 'body_multiloc'

    ui_field[:options]&.delete(:trim_on_blur) if ui_field.is_a?(Hash) && ui_field[:options].is_a?(Hash)

    ui_field
  end

  def generate_for(fields)
    uses_pages = fields.any?(&:page?)
    return super unless uses_pages

    generate_with_pages(fields)
  end

  def visit_topic_ids(field)
    default field
  end

  def visit_cosponsor_ids(field)
    default field
  end

  def visit_page(field)
    page_data = {
      type: 'Page',
      options: {
        input_type: field.input_type,
        id: field.id,
        title: multiloc_service.t(field.title_multiloc),
        description: description_option(field),
        page_layout: field.page_layout,
        map_config_id: field&.map_config&.id
      },
      elements: [
        # No elements yet. They will be added after invoking this method.
      ]
    }

    # Add these attributes only if the page key is "form_end"
    if field.form_end_page?
      page_data[:options][:page_button_label_multiloc] = field.page_button_label_multiloc
      page_data[:options][:page_button_link] = field.page_button_link
    end

    page_data
  end

  protected

  def default_options(field)
    defaults = {
      isAdminField: admin_field?(field),
      hasRule: field.logic?
    }
    if @supports_answer_visible_to
      defaults[:answer_visible_to] = field.visible_to_public? ? 'public' : 'admins'
    end
    defaults[:otherField] = field.other_option_text_field&.key if field.other_option_text_field
    defaults[:dropdown_layout] = field.dropdown_layout if field.dropdown_layout_type?
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
    form_end_page = nil

    fields.each do |field|
      field_schema = visit field
      if field.page?
        rules = form_logic.ui_schema_rules_for(field)
        field_schema[:ruleArray] = rules if rules.present?

        if field.form_end_page?
          form_end_page = field_schema
        else
          field_schemas << field_schema
          current_page_schema = field_schema
        end
      elsif current_page_schema
        current_page_schema[:elements] << field_schema
      else
        field_schemas << field_schema
      end
    end

    # Ensure form_end page is always last
    field_schemas << form_end_page if form_end_page

    field_schemas
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
    categorization_schema_with(input_term, schema_elements_for(fields))
  end

  def generate_for_current_locale(fields)
    category = {
      type: 'Page',
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
