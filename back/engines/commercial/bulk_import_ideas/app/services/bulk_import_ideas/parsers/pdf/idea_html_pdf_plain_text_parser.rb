# frozen_string_literal: true

module BulkImportIdeas::Parsers::Pdf
  class IdeaHtmlPdfPlainTextParser
    TEXT_FIELD_TYPES = %w[text multiline_text text_multiloc html_multiloc]
    NUMBER_FIELD_TYPES = %w[number linear_scale rating sentiment_linear_scale]
    SELECT_FIELD_TYPES = %w[select multiselect select_image multiselect_image]
    FILLED_OPTION_CHARS = %w[& ☑ ☒ > ①]
    MIN_DELIMITER_LENGTH = 8

    def initialize(locale)
      @locale = locale
    end

    def parse_text(pages, template_data)
      return unless pages && template_data

      field_option_config = template_data[:fields]
      field_config = field_option_config.select { |field| field[:type] == 'field' }
      option_config = field_option_config.select { |field| field[:type] == 'option' }

      pages = remove_page_numbers(pages)
      all_text = pages.join("\n")

      # TODO: What about long titles that wrap onto multiple lines?

      parsed_fields = field_config.each_with_object({}) do |field, result|
        # First get the text between the field title and the end delimiter as a broad match
        start_text = field[:print_title]
        end_text = field.dig(:content_delimiters, :end)
        field_text = extract_text_between(all_text, start_text, end_text)
        field[:text] = field_text

        # Now process the values
        value = if TEXT_FIELD_TYPES.include? field[:input_type]
          process_text_value(field, all_text)
        elsif NUMBER_FIELD_TYPES.include? field[:input_type]
          process_number_value(field, all_text)
        elsif SELECT_FIELD_TYPES.include? field[:input_type]
          process_selected_options(field, option_config)
        end
        result[field[:name]] = value unless value.nil?
      end

      {
        pdf_pages: (1..pages.length).to_a,
        fields: parsed_fields
      }
    end

    private

    # Extract text between two strings in a case insensitive manner
    def extract_text_between(text, start_string, end_string)
      return text if start_string.blank? || start_string.length < MIN_DELIMITER_LENGTH

      start_index = text.downcase.index(start_string.downcase)
      extracted_text = start_index ? text[(start_index + start_string.length)..].strip : text
      return extracted_text if end_string.blank? || end_string.length < MIN_DELIMITER_LENGTH

      end_index = extracted_text.downcase.index(end_string.downcase)
      return extracted_text unless end_index

      extracted_text[..(end_index - 1)].strip
    end

    # Remove page numbers
    def remove_page_numbers(pages)
      page_copy = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.page') }
      page_number_regex = Regexp.new "#{page_copy} \\d+$"
      pages.map do |page|
        page.gsub(page_number_regex, '')&.strip
      end
    end

    def process_text_value(field, all_text)
      # First split the text within the field to narrow it down to the actual text we want to use
      start_delimiter = field.dig(:content_delimiters, :start)
      value = extract_text_between(field[:text], start_delimiter, nil)
      return nil if value.length == all_text.length # If nothing extracted then the question has not been found

      value.tr("\n", ' ').strip
    end

    def process_number_value(field, all_text)
      value = process_text_value(field, all_text)
      return unless value
      return if value.length > 8 # Unlikely to be a number if it is this long

      # Convert any characters to numbers
      chars0 = %w[o O]
      chars1 = %w[l i I]
      chars2 = %w[z Z]
      chars5 = %w[s S]

      number_str = ''
      value.chars.each do |char|
        number_str += char if char.to_i.to_s == char
        number_str += '0' if chars0.include?(char)
        number_str += '1' if chars1.include?(char)
        number_str += '2' if chars2.include?(char)
        number_str += '5' if chars5.include?(char)
      end

      number_str.to_i
    end

    def process_selected_options(field, option_config)
      # Get the selected options from the field
      selected_options = []

      # Find only the options for this field from field_config
      options = option_config.select { |f| f[:parent_key] == field[:key] }

      option_lines = field[:text].split("\n")
      options.each do |option|
        option_lines.each do |line|
          if option_is_selected?(line, option[:name])
            selected_options << option[:name]
          end
        end
      end

      field[:input_type] == 'select' ? selected_options.first : selected_options
    end

    def option_is_selected?(line, option_text)
      return false unless line.include?(option_text)

      line = line.gsub(/#{option_text}/, '')
      FILLED_OPTION_CHARS.any? { |char| line.include?(char) }
    end
  end
end
