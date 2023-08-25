# frozen_string_literal: true
require 'prawn'
require 'prawn/measurement_extensions'

class PrintCustomFieldsService
  attr_reader :participation_context, :custom_fields, :params, :previous_cursor

  QUESTION_TYPES = %w[select multiselect text text_multiloc multiline_text html_multiloc linear_scale]
  FORBIDDEN_HTML_TAGS_REGEX = /<\/?(div|span|ul|ol|li|em|img|a){1}[^>]*\/?>/

  def initialize(participation_context, custom_fields, params)
    @participation_context = participation_context
    @custom_fields = custom_fields
    @params = params
    @previous_cursor = nil
  end

  def create_pdf
    pdf = Prawn::Document.new(page_size: 'A4')

    if params[:name] == 'true' then
      render_text_field_with_name(
        pdf,
        I18n.with_locale(locale) { I18n.t('form_builder.pdf_export.full_name') }
      )
    end

    if params[:email] == 'true' then
      render_text_field_with_name(
        pdf,
        I18n.with_locale(locale) { I18n.t('form_builder.pdf_export.email_address') }
      )
    end

    custom_fields.each_with_index do |custom_field, i|
      field_type = custom_field.input_type

      # If this is a survey, the first field will be a 'page'.
      # Since the pdf is initialized with an empty page,
      # we can skip this.
      next if i == 0 && field_type == 'page'

      if field_type == 'page' then
        pdf.start_new_page(size: 'A4')
      end

      # Skip unsupported question types
      next unless QUESTION_TYPES.include? field_type
      render_field(pdf, custom_field)
    end

    return pdf
  end

  private

  def render_text_field_with_name(pdf, name)
    title_multiloc = {}
    title_multiloc[locale] = name

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
    pdf.group do |pdf|
      # Write title
      write_title(pdf, custom_field)

      # Write description if it exists
      write_description(pdf, custom_field)

      # Write 
      # - '*Choose as many as you like', and/or
      # - '*This answer will only be shared with moderators, and not to the public.'
      # if necessary
      write_instructions_and_disclaimers(pdf, custom_field)

      pdf.move_down 7.mm

      if field_type == 'select' then
        draw_single_choice(pdf, custom_field)
      end

      if field_type == 'multiselect' then
        draw_multiple_choice(pdf, custom_field)
      end

      if ['text', 'text_multiloc'].include? field_type then
        draw_text_lines(pdf, 1)
      end

      if ['multiline_text', 'html_multiloc'].include? field_type then
        draw_text_lines(pdf, 7)
      end

      if field_type == 'linear_scale' then
        draw_linear_scale(pdf, custom_field)
      end
    end

    pdf.move_down 6.mm
  end

  def write_title(pdf, custom_field)
    optional = I18n.with_locale(locale) { I18n.t('form_builder.pdf_export.optional') }

    pdf.text(
      "<b>#{custom_field.title_multiloc[locale]}</b>#{custom_field.required? ? "" : " (#{optional})"}",
      size: 20,
      inline_format: true
    )
  end

  def write_description(pdf, custom_field)
    description = custom_field.description_multiloc[locale]
 
    unless description.nil? then
      pdf.move_down 3.mm
      paragraphs = parse_html_tags(description)

      paragraphs.each do |paragraph|
        pdf.text(paragraph, inline_format: true)
      end

      pdf.move_down 2.mm
    end
  end

  def write_instructions_and_disclaimers(pdf, custom_field)
    show_multiselect_instructions = custom_field.input_type == "multiselect"
    show_visibility_disclaimer = participation_context.participation_method == "ideation" && custom_field.answer_visible_to == "admins"

    if show_multiselect_instructions || show_visibility_disclaimer then
      pdf.move_down 5.mm

      if show_multiselect_instructions then
        pdf.text(
          "*#{I18n.with_locale(locale) { I18n.t('form_builder.pdf_export.choose_as_many') }}", 
          size: 12
        )
      end

      if show_visibility_disclaimer then
        pdf.text(
          "*#{I18n.with_locale(locale) { I18n.t('form_builder.pdf_export.this_answer') }}",
          size: 12
        )
      end
    end
  end

  def draw_single_choice(pdf, custom_field)
    custom_field.options.each do |option|
      pdf.stroke_color '000000'
      pdf.stroke_circle [3.mm, pdf.cursor], 5

      pdf.move_up 1.2.mm

      pdf.indent(7.mm) do
        pdf.text option.title_multiloc[locale]
      end

      pdf.move_down 5.mm
    end
  end

  def draw_multiple_choice(pdf, custom_field)
    custom_field.options.each do |option|
      pdf.stroke do
        pdf.stroke_color '000000'
        pdf.rectangle([1.5.mm, pdf.cursor + 1.5.mm], 10, 10)
      end

      pdf.move_up 1.2.mm

      pdf.indent(7.mm) do
        pdf.text option.title_multiloc[locale]
      end

      pdf.move_down 5.mm
    end
  end

  def draw_text_lines(pdf, lines)
    lines.times do
      pdf.text '_' * 47, color: '666666', size: 20, leading: 15
    end
  end

  def draw_linear_scale(pdf, custom_field)
    max_index = custom_field.maximum - 1

    # Draw number labels
    (0..max_index).each do |i|
      pdf.indent((i.to_f / max_index) * 100.mm + 1.8.mm) do
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
          3.mm + ((i.to_f / max_index) * 100.mm), 
          pdf.cursor
        ],
        5
      )
    end

    pdf.move_down 7.mm

    # Draw min and max labels
    save_cursor pdf

    pdf.indent(1.8.mm) do
      pdf.text custom_field.minimum_label_multiloc[locale]
    end

    reset_cursor pdf

    pdf.indent(101.mm) do
      pdf.text custom_field.maximum_label_multiloc[locale]
    end
  end

  def parse_html_tags(string)
    string
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
  
  def locale
    params[:locale]
  end
end