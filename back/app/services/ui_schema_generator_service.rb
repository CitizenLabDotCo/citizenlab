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
      ui_field[:options][:linear_scale_label1] = multiloc_service.t(field.linear_scale_label_1_multiloc)
      ui_field[:options][:linear_scale_label2] = multiloc_service.t(field.linear_scale_label_2_multiloc)
      ui_field[:options][:linear_scale_label3] = multiloc_service.t(field.linear_scale_label_3_multiloc)
      ui_field[:options][:linear_scale_label4] = multiloc_service.t(field.linear_scale_label_4_multiloc)
      ui_field[:options][:linear_scale_label5] = multiloc_service.t(field.linear_scale_label_5_multiloc)
      ui_field[:options][:linear_scale_label6] = multiloc_service.t(field.linear_scale_label_6_multiloc)
      ui_field[:options][:linear_scale_label7] = multiloc_service.t(field.linear_scale_label_7_multiloc)
      ui_field[:options][:linear_scale_label8] = multiloc_service.t(field.linear_scale_label_8_multiloc)
      ui_field[:options][:linear_scale_label9] = multiloc_service.t(field.linear_scale_label_9_multiloc)
      ui_field[:options][:linear_scale_label10] = multiloc_service.t(field.linear_scale_label_10_multiloc)
      ui_field[:options][:linear_scale_label11] = multiloc_service.t(field.linear_scale_label_11_multiloc)
    end
  end

  def visit_sentiment_linear_scale(field)
    default(field).tap do |ui_field|
      ui_field[:options][:ask_follow_up] = field.ask_follow_up
      ui_field[:options][:linear_scale_label1] = multiloc_service.t(field.linear_scale_label_1_multiloc)
      ui_field[:options][:linear_scale_label2] = multiloc_service.t(field.linear_scale_label_2_multiloc)
      ui_field[:options][:linear_scale_label3] = multiloc_service.t(field.linear_scale_label_3_multiloc)
      ui_field[:options][:linear_scale_label4] = multiloc_service.t(field.linear_scale_label_4_multiloc)
      ui_field[:options][:linear_scale_label5] = multiloc_service.t(field.linear_scale_label_5_multiloc)
    end
  end

  def visit_matrix_linear_scale(field)
    visit_linear_scale(field).tap do |ui_field|
      ui_field[:options][:statements] = field.matrix_statements.map do |statement|
        { key: statement.key, label: multiloc_service.t(statement.title_multiloc) }
      end
    end
  end

  def visit_select(field)
    default(field).tap do |ui_field|
      ui_field[:options][:enumNames] = field.ordered_transformed_options.map { |option| multiloc_service.t(option.title_multiloc) }
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

  def visit_page(field)
    if field.form_end_page?
      default(field).tap do |ui_field|
        ui_field[:options][:page_button_link] = field.page_button_link
        ui_field[:options][:page_button_label_multiloc] = multiloc_service.t(field.page_button_label_multiloc)
      end
    end
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
    locale = I18n.locale.to_s
    yield.tap do |ui_field|
      ui_field[:scope] = "#{ui_field[:scope]}/properties/#{locale}"
      ui_field[:options] ||= {}
      ui_field[:options][:input_type] = field.input_type
      ui_field[:options][:render] = 'multiloc'
    end
  end
end
