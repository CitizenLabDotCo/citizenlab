# frozen_string_literal: true

require 'prawn'
require 'prawn/measurement_extensions'

class BulkImportIdeas::PrintCustomFieldsService
  attr_reader :participation_context, :custom_fields, :params, :previous_cursor

  # We are still hiding linear scales for now because they are not supported
  # by the plaintext parse
  QUESTION_TYPES = %w[select multiselect text text_multiloc multiline_text html_multiloc number]
  FORBIDDEN_HTML_TAGS_REGEX = %r{</?(div|span|ul|ol|li|img|a){1}[^>]*/?>}

  def initialize(phase, custom_fields, locale, personal_data_enabled)
    @phase = phase
    @custom_fields = custom_fields
    @locale = locale
    @personal_data_enabled = personal_data_enabled
    @previous_cursor = nil
    @app_configuration = AppConfiguration.instance
    @importer_fields = []
  end

  def create_pdf
    pdf = Prawn::Document.new(page_size: 'A4')

    load_font pdf

    render_tenant_logo pdf
    write_form_title pdf
    write_instructions pdf

    if @personal_data_enabled
      render_personal_data_section pdf
    end

    custom_fields.each_with_index do |custom_field, i|
      field_type = custom_field.input_type

      # If this is a survey, the first field will be a 'page'.
      # Since the pdf is initialized with an empty page,
      # we can skip this.
      next if i == 0 && field_type == 'page'

      if field_type == 'page'
        pdf.start_new_page(size: 'A4')
      end

      # Skip unsupported question types
      next unless QUESTION_TYPES.include? field_type

      render_field(pdf, custom_field)
    end

    # Add page numbers
    page_copy = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.page') }
    page_number_format = "#{page_copy} <page>"
    page_number_options = {
      at: [pdf.bounds.right - 150, 0],
      width: 150,
      align: :right

    }

    pdf.number_pages page_number_format, page_number_options

    pdf
  end

  def importer_data
    {
      page_count: create_pdf.page_count,
      fields: @importer_fields
    }
  end

  private

  def load_font(pdf)
    open_sans_path = Rails.root.join('app/assets/fonts/Open_Sans/static')

    pdf.font_families.update('OpenSans' => {
      normal: "#{open_sans_path}/OpenSans-Regular.ttf",
      italic: "#{open_sans_path}/OpenSans-Italic.ttf",
      bold: "#{open_sans_path}/OpenSans-Bold.ttf",
      bold_italic: "#{open_sans_path}/OpenSans-BoldItalic.ttf"
    })

    pdf.font 'OpenSans'
  end

  def render_tenant_logo(pdf)
    logo = @app_configuration.logo&.medium
    return if logo.blank? || logo.url&.include?('.gif')

    pdf.image URI.open logo.to_s
    pdf.move_down 10.mm
  end

  def write_form_title(pdf)
    phase_title = @phase.title_multiloc[@locale]
    project_title = @phase.project.title_multiloc[@locale]

    pdf.text(
      "<b>#{project_title} - #{phase_title}</b>",
      size: 20,
      inline_format: true
    )

    pdf.move_down 9.mm
  end

  def write_instructions(pdf)
    pdf.text(
      "<b>#{I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.instructions') }}</b>",
      size: 16,
      inline_format: true
    )

    pdf.move_down 5.mm

    pdf.fill do
      pdf.fill_color '000000'
      pdf.rectangle([1, pdf.cursor + 1.5.mm], 3, 36)
    end

    pdf.move_up 1.2.mm

    %w[write_as_clearly write_in_language].each do |key|
      save_cursor pdf
      pdf.indent(5.mm) { pdf.text('•') }
      reset_cursor pdf

      pdf.indent(10.mm) do
        pdf.text(
          (I18n.with_locale(@locale) { I18n.t("form_builder.pdf_export.#{key}") }).to_s,
          size: 12,
          inline_format: true
        )
      end
    end

    pdf.move_down 8.mm
  end

  def render_personal_data_section(pdf)
    # Personal data header
    pdf.text(
      "<b>#{I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.personal_data') }}</b>",
      size: 16,
      inline_format: true
    )

    pdf.move_down 4.mm

    # Personal data explanation
    participation_method = @phase.participation_method
    personal_data_explanation_key = "form_builder.pdf_export.personal_data_explanation_#{participation_method}"
    pdf.text I18n.with_locale(@locale) {
      I18n.t(
        personal_data_explanation_key,
        organizationName: organization_name
      )
    }

    pdf.move_down 8.mm

    # Fields
    %w[first_name last_name email_address].each do |key|
      render_text_field_with_name(
        pdf,
        I18n.with_locale(@locale) { I18n.t("form_builder.pdf_export.#{key}") }
      )
    end

    # Checkbox
    pdf.stroke do
      pdf.stroke_color '000000'
      pdf.rectangle([1.5.mm, pdf.cursor + 1.5.mm], 10, 10)
    end

    pdf.move_up 2.8.mm

    pdf.indent(7.mm) do
      pdf.text I18n.with_locale(@locale) {
        I18n.t(
          'form_builder.pdf_export.by_checking_this_box',
          organizationName: organization_name
        )
      }
    end

    pdf.start_new_page(size: 'A4')
  end

  def render_text_field_with_name(pdf, name)
    title_multiloc = {}
    title_multiloc[@locale] = name

    text_field = CustomField.new({
      input_type: 'text',
      title_multiloc: title_multiloc
    })

    render_field(pdf, text_field)
  end

  def render_field(pdf, custom_field)
    field_type = custom_field.input_type

    # The .group block makes sure that everything
    # inside of it will be on a new page if there
    # is not enough space on the current page
    pdf.group do |pdf_group|
      # Add field to array to use in import
      add_to_importer_fields(custom_field, 'field', pdf.page_number, pdf.y)

      # Write title
      write_title(pdf_group, custom_field)

      # Write description if it exists
      write_description(pdf_group, custom_field)

      # Write
      # - '*Choose as many as you like', and/or
      # - '*This answer will only be shared with moderators, and not to the public.'
      # if necessary
      write_instructions_and_disclaimers(pdf_group, custom_field)

      pdf_group.move_down 7.mm

      case field_type
      when 'select'
        render_single_choice(pdf_group, custom_field)
      when 'multiselect'
        render_multiple_choice(pdf_group, custom_field)
      when 'linear_scale'
        render_linear_scale(pdf_group, custom_field)
      when 'multiline_text', 'html_multiloc'
        render_text_lines(pdf_group, 7)
      else # text, text_multiloc, number
        render_text_lines(pdf_group, 1)
      end
    end

    pdf.move_down 6.mm
  end

  def write_title(pdf, custom_field)
    optional = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.optional') }

    pdf.text(
      "<b>#{custom_field.title_multiloc[@locale]}</b>#{custom_field.required? ? '' : " (#{optional})"}",
      size: 16,
      inline_format: true
    )
  end

  def write_description(pdf, custom_field)
    description = custom_field.description_multiloc[@locale]
    if description.present?
      pdf.move_down 3.mm
      paragraphs = parse_html_tags(description)

      paragraphs.each do |paragraph|
        pdf.text(paragraph, inline_format: true)
      end
    end
  end

  def write_instructions_and_disclaimers(pdf, custom_field)
    show_multiselect_instructions = custom_field.input_type == 'multiselect'
    participation_method = Factory.instance.participation_method_for @phase
    show_visibility_disclaimer = participation_method.supports_idea_form? && custom_field.answer_visible_to == 'admins'

    if show_multiselect_instructions || show_visibility_disclaimer
      pdf.move_down 5.mm

      if show_multiselect_instructions
        pdf.text(
          "*#{I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.choose_as_many') }}",
          size: 10
        )
      end

      if show_visibility_disclaimer
        pdf.text(
          "*#{I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.this_answer') }}",
          size: 10
        )
      end
    end
  end

  def render_single_choice(pdf, custom_field)
    custom_field.options.each do |option|
      # Add option to array to use in import
      add_to_importer_fields(option, 'option', pdf.page_number, pdf.y)

      pdf.stroke_color '000000'
      pdf.stroke_circle [3.mm, pdf.cursor], 5

      pdf.move_up 3.mm

      pdf.indent(7.mm) do
        pdf.text option.title_multiloc[@locale]
      end

      pdf.move_down 5.mm
    end
  end

  def render_multiple_choice(pdf, custom_field)
    custom_field.options.each do |option|
      # Add option to array to use in import
      add_to_importer_fields(option, 'option', pdf.page_number, pdf.y)

      pdf.stroke do
        pdf.stroke_color '000000'
        pdf.rectangle([1.5.mm, pdf.cursor + 1.5.mm], 10, 10)
      end

      pdf.move_up 2.8.mm

      pdf.indent(7.mm) do
        pdf.text option.title_multiloc[@locale]
      end

      pdf.move_down 5.mm
    end
  end

  def render_text_lines(pdf, lines)
    lines.times do
      pdf.text '_' * 59, color: '666666', size: 20, leading: 15
    end
  end

  def render_linear_scale(pdf, custom_field)
    max_index = custom_field.maximum - 1
    width = 80.mm

    if custom_field.maximum > 3
      width = 100.mm
    end

    if custom_field.maximum > 5
      width = 120.mm
    end

    # Draw number labels
    (0..max_index).each do |i|
      pdf.indent(((i.to_f / max_index) * width) + 1.8.mm) do
        save_cursor pdf

        pdf.text((i + 1).to_s)

        reset_cursor pdf
      end
    end

    pdf.move_down 7.mm

    # Draw checkboxes
    (0..max_index).each do |i|
      pdf.stroke_color '000000'
      pdf.stroke_circle(
        [
          3.mm + ((i.to_f / max_index) * width),
          pdf.cursor
        ],
        5
      )
    end

    pdf.move_down 7.mm

    # Draw min and max labels
    save_cursor pdf

    pdf.indent(1.8.mm) do
      pdf.text custom_field.minimum_label_multiloc[@locale]
    end

    reset_cursor pdf

    pdf.indent(width + 1.mm) do
      pdf.text custom_field.maximum_label_multiloc[@locale]
    end
  end

  def parse_html_tags(string)
    string
      .gsub('<em>', '<i>')
      .gsub('</em>', '</i>')
      .gsub(FORBIDDEN_HTML_TAGS_REGEX, '')
      .gsub('<p>', '')
      .split('</p>')
  end

  def save_cursor(pdf)
    @previous_cursor = pdf.cursor
  end

  def reset_cursor(pdf)
    pdf.move_down pdf.cursor - previous_cursor
  end

  def organization_name
    @app_configuration.settings('core', 'organization_name')[@locale]
  end

  def add_to_importer_fields(field, type, page, position)
    position = (810 - position) / 8.1 # Convert the position into equivalent of what form parser returns
    key = field[:key]
    parent_key = type == 'option' ? field.custom_field.key : nil

    # Because of the way pdf group works we delete if value is already there and always use the last value for the field
    @importer_fields.delete_if { |f| f[:key] == key && f[:parent_key] == parent_key }

    @importer_fields << {
      name: field[:title_multiloc][@locale],
      type: type,
      input_type: field[:input_type],
      code: field[:code],
      key: key,
      parent_key: parent_key,
      page: page,
      position: position.to_i
    }
  end
end
