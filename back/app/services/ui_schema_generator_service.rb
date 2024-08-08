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
      default(field).tap do |ui_field|
        ui_field[:options][:render] = 'WYSIWYG'
        ui_field[:options][:trim_on_blur] = true
      end
    end
  end

  def visit_point(field)
    default(field).tap do |ui_field|
      ui_field[:options][:map_config_id] = field&.map_config&.id
    end
  end

  def visit_line(field)
    default(field).tap do |ui_field|
      ui_field[:options][:map_config_id] = field&.map_config&.id
    end
  end

  def visit_polygon(field)
    default(field).tap do |ui_field|
      ui_field[:options][:map_config_id] = field&.map_config&.id
    end
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

  def visit_page(_field)
    nil
  end

  protected

  def generate_for_current_locale(fields)
    raise NotImplementedError
  end

  def default_options(field)
    {
      description: description_option(field)
    }.tap do |options|
      unless field.multiloc?
        options[:input_type] = field.input_type
        field.ordered_options.map { |option| multiloc_service.t(option.title_multiloc) }
        if field.input_type == 'select'
          options[:enumNames] = field.ordered_options.map { |option| multiloc_service.t(option.title_multiloc) }
        end
      end
    end
  end

  def description_option(field)
    @descriptions ||= {}
    locale = I18n.locale.to_s
    @descriptions[locale] ||= {}
    @descriptions[locale][field] ||= multiloc_service.t TextImageService.new.render_data_images_multiloc(field.description_multiloc, field: :description_multiloc, imageable: field)
  end

  private

  attr_reader :locales, :multiloc_service

  def multiloc_field(field)
    elements = locales.map do |locale|
      yield.tap do |ui_field|
        ui_field[:scope] = "#{ui_field[:scope]}/properties/#{locale}"
        ui_field[:options][:locale] = locale
      end
    end
    {
      type: 'VerticalLayout',
      options: { input_type: field.input_type, render: 'multiloc' },
      elements: elements
    }
  end
end
