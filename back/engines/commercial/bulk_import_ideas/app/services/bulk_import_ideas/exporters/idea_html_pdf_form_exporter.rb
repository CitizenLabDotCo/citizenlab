# frozen_string_literal: true

module BulkImportIdeas::Exporters
  class IdeaHtmlPdfFormExporter < IdeaHtmlFormExporter
    def format
      'pdf'
    end

    def mime_type
      'application/pdf'
    end

    def filename
      'form.pdf'
    end

    # Render the form from HTML as a PDF using Chromium on Gotenberg container
    def export
      html = ActionController::Base.new.render_to_string render_config
      gb = GotenbergClient.new
      gb.render_to_pdf(html)
    end

    # Extract the text from this PDF so we understand how each field is laid out in the PDF - Needed for the PDF import
    def importer_data
      @importer_data ||= begin
        file = export
        reader = PDF::Reader.new(file)

        # Get an array of lines for each page of the PDF
        pages = reader.pages.map do |page|
          page.text.split("\n").map do |line|
            line.sub(optional_text, '')&.strip # Remove the optional text from each field title
          end
        end

        field_import_configs = []
        question_num = 0
        form_fields.each_with_index do |field, index|
          question_number = field_has_question_number?(field) ? question_num += 1 : nil
          field_import_configs << import_config_for_field(field, pages, question_number, form_fields[index + 1])
          field.options.each do |option|
            field_import_configs << import_config_for_field(option, pages)
          end
        end

        {
          page_count: pages.count,
          fields: field_import_configs.compact
        }
      end
    end

    private

    def import_config_for_field(field_or_option, pdf_pages, question_number = nil, next_field = nil)
      field_config = nil
      type = field_or_option.is_a?(CustomField) ? 'field' : 'option'
      title = field_full_print_title(field_or_option, question_number, type)

      pdf_pages.each_with_index do |page_lines, index|
        page_num = index + 1
        field_line_num = find_page_line(page_lines, title)
        if field_line_num
          # Convert the line number into a position 0 - 100 in the page (equivalent of what the google form parser returns)
          position = ((field_line_num + 1) * (100 / page_lines.length.to_f)).round

          # Do not include if the field is not pdf_importable?
          next if type == 'field' && !field_or_option.pdf_importable?

          field_config = {
            name: title,
            type: type,
            key: field_or_option.key,
            page: page_num,
            position: position.to_i
          }

          if type == 'field'
            # Only needed for custom fields
            field_config[:input_type] = field_or_option[:input_type]
            field_config[:code] = field_or_option[:code]
            field_config[:description] = ActionView::Base.full_sanitizer.sanitize(field_or_option[:description_multiloc][@locale])
            field_config[:content_delimiters] = field_content_delimiters(field_or_option, next_field, question_number, page_lines, field_line_num)
          else
            # Only needed for options
            field_config[:parent_key] = field_or_option.custom_field.key

            # Blank out option once processed - To avoid them being found again when there multiple options on a page with the same value
            pdf_pages[index][page_lines.find_index(title)] = ''
          end

          break # No need to check the rest of the pages - causes issues with duplicate options if we do
        end
      end

      field_config
    end

    # Grabs the text lines where fields start and end so that we can split out from the value
    # any greedily scanned text that includes content from the part of the form and not handwritten text
    # End delimiter is the text line where the next field or element starts
    # Start delimiter is the text line before - end of previous field title / description
    # If the field is the last on a page there is no end delimiter
    def field_content_delimiters(field, next_field, current_question_number, page_lines, _field_line_num)
      return unless field.support_text? # Delimiters are only needed for text fields

      page_text = page_lines.reject(&:empty?) # Remove empty lines
      page_text.pop # Remove the last line which is always the page number

      next_line_index = nil

      if next_field
        # Get delimiter by using the next field
        next_question_number = current_question_number && field_has_question_number?(next_field) ? current_question_number + 1 : nil
        next_question_title = field_full_print_title(next_field, next_question_number)
        next_line_index = find_page_line(page_text, next_question_title)
      elsif next_field.nil? && @participation_method.custom_form.print_end_multiloc[@locale].present?
        # Get delimiter from the end of the form
        end_text = ActionView::Base.full_sanitizer.sanitize(@participation_method.custom_form.print_end_multiloc[@locale])
        next_line_index = find_page_line(page_text, end_text)
      end

      {
        start: next_line_index ? page_text[next_line_index - 1] : page_text.last,
        end: next_line_index ? page_text[next_line_index] : nil
      }
    end

    # Find the index of the line in the page that matches the start of the text
    def find_page_line(page, text)
      page.find_index { |value| value.present? && text.start_with?(value) }
    end

    # Returns full printed title with number eg "1. Title"
    def field_full_print_title(field, question_number = nil, type = 'field')
      title = type == 'field' && question_number ? "#{question_number}. " : ''
      title += field_print_title(field)
      title
    end

    # Allow rendering of images in the PDF when in development
    def format_html_field(description)
      new_description = super
      new_description&.sub!('localhost:4000', 'cl-back-web:4000') if Rails.env.development?
      new_description
    end
  end
end
