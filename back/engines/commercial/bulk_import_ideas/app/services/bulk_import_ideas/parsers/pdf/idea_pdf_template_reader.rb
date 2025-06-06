# frozen_string_literal: true

module BulkImportIdeas::Parsers::Pdf
  class IdeaPdfTemplateReader
    def initialize(phase, locale, personal_data_enabled)
      @phase = phase
      @locale = locale
      @personal_data_enabled = personal_data_enabled
    end

    # Extract the text from the template PDF so we understand how each field is laid out in the PDF
    def template_data
      @template_data ||= begin
        # Cached if form has not changed to avoid generating a new PDF just for this data
        form = @phase.pmethod.custom_form
        cache_key = "pdf_importer_data/#{form.id}_#{@locale}_#{form.updated_at.to_i}_#{@personal_data_enabled}"
        Rails.cache.fetch(cache_key, expires_in: 1.day) do
          file = pdf_exporter.export
          pages = pdf_pages(PDF::Reader.new(file))
          form_fields = pdf_exporter.printable_fields

          field_import_configs = []
          question_num = 0
          form_fields.each_with_index do |field, index|
            question_number_incremented = pdf_exporter.field_has_question_number?(field)
            question_number = question_number_incremented ? question_num += 1 : question_num
            field_import_configs << import_config_for_field(
              field,
              pages,
              latest_question_number: question_number,
              question_number_printed: question_number_incremented,
              next_field: form_fields[index + 1]
            )
            field.options.each do |option|
              field_import_configs << import_config_for_field(option, pages)
            end
          end

          field_import_configs = fix_nil_positions(field_import_configs.compact)

          {
            page_count: pages.count,
            fields: field_import_configs
          }
        end
      end
    end

    private

    # Get an array of lines for each page of the PDF
    def pdf_pages(reader)
      reader.pages.map do |page|
        page.text.split("\n").map do |line|
          line.gsub(/\s+/, ' ').strip # Remove extra spaces in each line
        end
      end
    end

    def import_config_for_field(field_or_option, pdf_pages, latest_question_number: nil, question_number_printed: false, next_field: nil)
      type = field_or_option.is_a?(CustomField) ? 'field' : 'option'
      return if type == 'field' && !field_or_option.pdf_importable? # Skip fields that are not importable
      return if type == 'option' && !field_or_option.custom_field.pdf_importable? # Skip options whose fields are not importable

      print_title = if type == 'field'
        full_print_title(field_or_option, question_number_printed ? latest_question_number : nil)
      else
        field_title(field_or_option)
      end

      # Try and find the position of the field and any content delimiters in the PDF
      page_num = nil
      position = nil
      content_delimiters = {}
      pdf_pages.each_with_index do |page_lines, index|
        current_page_num = index + 1
        field_line_num = find_field_line(page_lines, print_title) || find_option_line(page_lines, print_title)
        if field_line_num
          # Convert the line number into a position 0 - 100 in the page (equivalent of what the google form parser returns)
          position = ((field_line_num + 1) * (100 / page_lines.length.to_f)).round.to_i
          page_num = current_page_num

          if type == 'field'
            current_line = page_lines[field_line_num]
            content_delimiters = field_content_delimiters(field_or_option, next_field, latest_question_number, page_lines, current_line)
          end

          # Blank out once processed - Avoid them being found again when there multiple questions/options on a page with the same values
          if type == 'option' && field_or_option.custom_field.options.length > 4
            # For options in columns we just remove the option title from the line as there are multiple options on the same line
            truncated_title = print_title.slice(0, 35) # Truncate title to avoid issues with long titles
            pdf_pages[index][field_line_num].gsub!(truncated_title, '')
          else
            # For everything else we remove the whole line
            pdf_pages[index][field_line_num] = ''
          end

          break # No need to check the rest of the pages - causes issues with duplicate options if we do
        end
      end

      # Domicile options (when user fields in form enabled) need different keys
      key = field_or_option.key
      if type == 'option' && field_or_option.custom_field.key == 'u_domicile'
        key = field_or_option.area&.id || 'outside'
      end

      # Create a config for the field or option
      field_config = {
        name: field_title(field_or_option),
        type: type,
        key: key,
        page: page_num,
        position: position
      }

      if type == 'field'
        # Only needed for custom fields
        field_config[:code] = field_or_option[:code]
        field_config[:input_type] = field_or_option[:input_type]
        field_config[:description] = ActionView::Base.full_sanitizer.sanitize(field_or_option[:description_multiloc][@locale])
        field_config[:print_title] = print_title
        field_config[:content_delimiters] = content_delimiters
      else
        # Only needed for options
        field_config[:parent_key] = field_or_option.custom_field.key
      end

      field_config
    end

    # Grabs the text lines where fields start and end so that we can split out from the value
    # any greedily scanned text that includes content from the part of the form and not handwritten text
    # End delimiter is the text line where the next field or element starts
    # Start delimiter is the text line before - end of previous field title / description
    # If the field is the last on a page there is no end delimiter
    def field_content_delimiters(field, next_field, latest_question_number, page_lines, current_line)
      page_text = page_lines.reject(&:empty?) # Remove empty lines
      page_text = page_text.grep_v(/\A[i\(\)\s]*\z/) # Remove some odd lines that are read from the PDF with just i or ( ) in them
      page_text.pop # Remove the last line which is always the page number

      next_line_index = nil
      next_question_title = nil

      if next_field
        # Get delimiter by using the next field
        next_question_number = latest_question_number && pdf_exporter.field_has_question_number?(next_field) ? latest_question_number + 1 : nil
        next_question_title = full_print_title(next_field, next_question_number)
        next_line_index = find_field_line(page_text, next_question_title)
      elsif next_field.nil? && custom_form.print_end_multiloc[@locale].present?
        # Get delimiter from the end of the form
        end_text = ActionView::Base.full_sanitizer.sanitize(custom_form.print_end_multiloc[@locale])
        next_line_index = find_field_line(page_text, end_text)
      end

      # If we have the 'this answer will be shared with...' copy (after the question) then we must move both delimiters up one line
      next_line_index ||= page_text.length # If no next line found then use the end of the page
      start_line_index = next_line_index - 1
      this_answer_copy = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.this_answer') }.slice(0, 50)
      if page_text[start_line_index].include?(this_answer_copy)
        start_line_index -= 1
        next_line_index -= 1
      end

      {
        start: field.support_options? ? current_line : page_text[start_line_index], # Select fields use just the current line as start is less important
        end: page_text[next_line_index] ? page_text[next_line_index].strip : next_question_title&.slice(0, 50)&.strip # truncated next_question_title will be used if this is the last field on the page
      }
    end

    # Find the index of the line in the page that matches the start of the field title (in a case insensitive way)
    def find_field_line(page, field_title)
      page.find_index { |page_line| page_line.present? && field_title.strip.downcase.start_with?(page_line.strip.downcase) }
    end

    # Find the index of the line in the page that includes the option title (slightly less specific than question titles)
    def find_option_line(page, option_title)
      # TODO: Maybe need to truncate the option title for multi-line titles

      page.find_index { |value| value.include?(option_title) }
    end

    # Some questions/options may not be found - we make a guess at the position by looking at the values of the field before
    def fix_nil_positions(fields)
      # Set the position of any fields that are nil to the position of the first field
      last_position = 1
      last_page = 1
      fields.each do |field|
        if field[:page].nil? || field[:position].nil?
          field[:page] = last_page
          field[:position] = last_position + 2
        else
          last_page = field[:page]
          last_position = field[:position]
        end
      end

      fields
    end

    def print_format(field)
      pdf_exporter.print_format(field)
    end

    # Returns full printed title with number & optional eg "1. Title (optional)"
    def full_print_title(field, question_number = nil)
      title = question_number ? "#{question_number}. " : ''
      title += field_title(field)
      title += " #{pdf_exporter.optional_text}" unless field.required? || field.page?
      title
    end

    def field_title(field)
      CustomFieldService.new.handle_title(field, @locale)
    end

    def custom_form
      @custom_form ||= pdf_exporter.printable_fields.first.resource
    end

    def pdf_exporter
      @pdf_exporter ||= BulkImportIdeas::Exporters::IdeaPdfFormExporter.new(@phase, @locale, @personal_data_enabled)
    end
  end
end
