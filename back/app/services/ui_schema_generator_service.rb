# frozen_string_literal: true

class UiSchemaGeneratorService < FieldVisitorService
  # Code comes from back/app/services/json_forms_service.rb

  def initialize
    super
    # configuration = AppConfiguration.instance
    @locales = configuration.settings('core', 'locales')
    @multiloc_service = MultilocService.new app_configuration: @configuration
    @current_locale = 'en'
  end

  def generate_for(fields)
    locales.index_with do |locale|
      elements = ui_schema_elements fields, locale
      elements_to_ui_schema elements
    end
  end

  def ui_schema_elements(fields, locale)
    @current_locale = locale
    fields_for_ui_schema(fields).filter_map do |field|
      next nil if !field.enabled? || field.hidden?

      visit field
    end
  end

  def fields_for_ui_schema(fields)
    # Filter out and reorder fields
    fields
  end

  def elements_to_ui_schema(elements)
    # Set properties such as type and options
    {
      elements: elements
    }
  end

  #   # TODO: keep overrides for later
  #   # field_properties = fields.each_with_object({}) do |field, accu|
  #   #   override_method = "#{field.resource_type.underscore}_#{field.code}_to_json_schema_field"
  #   #   accu[field.key] = if field.code && respond_to?(override_method, true)
  #   #     send(override_method, field, locale)
  #   #   else
  #   #     send("#{field.input_type}_to_json_schema_field", field, locale)
  #   #   end
  #   # end
  #   @current_locale = locale
  #   field_properties = fields.each_with_object({}) do |field, accu|
  #     accu[field.key] = visit field
  #   end
  #   {
  #     type: 'object',
  #     additionalProperties: false,
  #     properties: field_properties
  #   }.tap do |output|
  #     required = fields.select(&:enabled?).select(&:required?).map(&:key)
  #     output[:required] = required unless required.empty?
  #   end
  # end

  def visit_text(field)
    default(field).tap do |ui_field|
      ui_field[:options][:transform] = 'trim_on_blur'
    end
  end

  def visit_multiline_text(field)
    default(field).tap do |ui_field|
      ui_field[:options][:textarea] = true
      ui_field[:options][:transform] = 'trim_on_blur'
    end
  end

  def visit_html(field)
    default(field).tap do |ui_field|
      ui_field[:options][:render] = 'WYSIWYG'
    end
  end

  def visit_text_multiloc(_field)
    multiloc_field(field) do
      default(field).tap do |ui_field|
        ui_field[:options][:trim_on_blur] = true
      end
    end
  end

  def visit_multiline_text_multiloc(_field)
    multiloc_field(field) do
      default(field).tap do |ui_field|
        ui_field[:options][:textarea] = true
        ui_field[:options][:trim_on_blur] = true
      end
    end
  end

  def visit_html_multiloc(_field)
    multiloc_field(field) do
      visit_html(field).tap do |ui_field|
        ui_field[:options][:trim_on_blur] = true
      end
    end
  end

  def visit_select(field)
    default field
  end

  def visit_multiselect(field)
    default field
  end

  def visit_checkbox(_field)
    default field
  end

  def visit_date(_field)
    default field
  end

  def visit_files(_field)
    default field
  end

  def visit_image_files(_field)
    default field
  end

  def visit_point(_field)
    nil
  end

  def default(field)
    {
      type: 'Control',
      scope: "#/properties/#{field.key}",
      label: for_current_locale(field.title_multiloc),
      options: {
        desciption: for_current_locale(field.description_multiloc)
      }
    }
  end

  private

  attr_reader :locales, :multiloc_service, :current_locale

  def multiloc_field(_field)
    elements = locales.map do |locale|
      yield.tap do |ui_field|
        ui_field[:scope] = "#{ui_field[:scope]}/properties/#{locale}"
        ui_field[:options][:locale] = locale
      end
    end
    {
      type: 'VerticalLayout',
      options: { render: 'multiloc' },
      elements: elements
    }
  end

  def for_current_locale(multiloc)
    I18n.with_locale(current_locale) do
      multiloc_service.t multiloc
    end
  end
end
