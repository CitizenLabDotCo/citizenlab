# frozen_string_literal: true

class UiSchemaGeneratorService < FieldVisitorService
  def initialize
    super
    configuration = AppConfiguration.instance
    @locales = configuration.settings('core', 'locales')
    @multiloc_service = MultilocService.new app_configuration: configuration
  end

  def generate_for(fields)
    locales.index_with do |locale|
      I18n.with_locale(locale) do
        generate_for_current_locale fields
      end
    end
  end

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

  def visit_text_multiloc(field)
    multiloc_field(field) do
      default(field).tap do |ui_field|
        ui_field[:options][:trim_on_blur] = true
      end
    end
  end

  def visit_multiline_text_multiloc(field)
    multiloc_field(field) do
      default(field).tap do |ui_field|
        ui_field[:options][:textarea] = true
        ui_field[:options][:trim_on_blur] = true
      end
    end
  end

  def visit_html_multiloc(field)
    multiloc_field(field) do
      visit_html(field).tap do |ui_field|
        ui_field[:options][:trim_on_blur] = true
      end
    end
  end

  def visit_point(_field)
    nil
  end

  def visit_linear_scale(field)
    default(field).tap do |ui_field|
      ui_field[:options][:minimum_label] = multiloc_service.t(field.minimum_label_multiloc)
      ui_field[:options][:maximum_label] = multiloc_service.t(field.maximum_label_multiloc)
    end
  end

  def default(field)
    {
      type: 'Control',
      scope: "#/properties/#{field.key}",
      label: multiloc_service.t(field.title_multiloc),
      options: default_options(field)
    }
  end

  protected

  def generate_for_current_locale(fields)
    raise NotImplementedError
  end

  def default_options(field)
    { description: multiloc_service.t(field.description_multiloc) }
  end

  private

  attr_reader :locales, :multiloc_service

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
end
