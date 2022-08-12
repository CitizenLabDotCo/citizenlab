# frozen_string_literal: true

class UiSchemaGeneratorService < FieldVisitorService
  # Code comes from back/app/services/json_forms_service.rb

  def initialize
    super
    configuration = AppConfiguration.instance
    @locales = configuration.settings('core', 'locales')
    @multiloc_service = MultilocService.new app_configuration: configuration
    @current_locale = 'en'
  end

  def generate_for(fields)
    locales.index_with do |locale|
      @current_locale = locale
      generate_for_current_locale fields
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

  def default(field)
    {
      type: 'Control',
      scope: "#/properties/#{field.key}",
      label: for_current_locale(field.title_multiloc),
      options: {
        description: for_current_locale(field.description_multiloc)
      }
    }
  end

  protected

  def generate_for_current_locale(fields)
    raise NotImplementedError
  end

  def visit_or_filter(field)
    return nil if !field || !field.enabled? || field.hidden?

    visit field
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
