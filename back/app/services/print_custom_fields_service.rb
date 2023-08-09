# frozen_string_literal: true

class PrintCustomFieldsService
  attr_reader :custom_fields, :params

  QUESTION_TYPES = %w[select multiselect text multiline_text linear_scale]
  FORBIDDEN_HTML_TAGS_REGEX = /<\/?(div|span|ul|ol|li|em|img|a){1}[^>]*\/?>/

  def initialize(custom_fields, params)
    @custom_fields = custom_fields
    @params = params
  end

  def create_pdf
    pdf = Prawn::Document.new(page_size: 'A4')

    custom_fields.each_with_index do |custom_field, i|
      # First custom_field should always be a page.
      # Since the pdf already has a page when it's
      # created we can skip this.
      next if i == 0

      field_type = custom_field.input_type

      if field_type == 'page' then
        pdf.start_new_page(size: 'A4')
      end

      # Skip unsupported question types
      next unless QUESTION_TYPES.include? field_type
      
      # Write title
      write_title(pdf, custom_field)

      # Write description if it exists
      write_description(pdf, custom_field)

      pdf.move_down 7.mm

      if field_type == 'select' then
        custom_field.options.each do |option|
          pdf.stroke_color '000000'
          pdf.stroke_circle [3.mm, pdf.cursor], 5

          pdf.bounding_box([7.mm, pdf.cursor + 4], width: 180.mm, height: 10.mm) do
            pdf.text option.title_multiloc[params[:locale]]
          end
        end
      end

      if field_type == 'multiselect' then
        custom_field.options.each do |option|
          pdf.stroke do
            pdf.stroke_color '000000'
            pdf.rectangle([1.5.mm, pdf.cursor + 1.5.mm], 10, 10)
          end

          pdf.bounding_box([7.mm, pdf.cursor + 4], width: 180.mm, height: 10.mm) do
            pdf.text option.title_multiloc[params[:locale]]
          end
        end
      end

      if field_type == 'text' then
        draw_text_line(pdf)
      end

      if field_type == 'multiline_text' then
        (1..7).each do
          draw_text_line(pdf)
        end
      end

      if field_type == 'linear_scale' then
        max_index = custom_field.maximum - 1

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

        pdf.move_down 4.mm

        pdf.text custom_field.minimum_label_multiloc[params[:locale]]

        pdf.bounding_box([100.mm, pdf.cursor + 5.1.mm], width: 80.mm, height: 10.mm) do
          pdf.text custom_field.maximum_label_multiloc[params[:locale]]
        end
        # puts custom_field.maximum (min 2, max 7)
        # puts custom_field.minimum_label_multiloc
        # puts custom_field.maximum_label_multiloc
      end

      pdf.move_down 6.mm
    end

    return pdf
  end

  private

  def write_title(pdf, custom_field)
    pdf.text(
      "<b>#{custom_field.title_multiloc[params[:locale]]}</b>",
      size: 20,
      inline_format: true
    )
  end

  def write_description(pdf, custom_field)
    description = custom_field.description_multiloc[params[:locale]]
 
    unless description.nil? then
      pdf.move_down 3.mm
      paragraphs = parse_html_tags(description)

      paragraphs.each do |paragraph|
        pdf.text(paragraph, inline_format: true)
      end

      pdf.move_down 2.mm
    end
  end

  def parse_html_tags(string)
    string
      .gsub(FORBIDDEN_HTML_TAGS_REGEX, '')
      .gsub('<p>', '')
      .split('</p>')
  end

  def draw_text_line(pdf)
    pdf.text '_' * 47, color: 'EBEBEB', size: 20
  end
end