# frozen_string_literal: true

module BulkImportIdeas::Parsers::Pdf
  class IdeaHtmlPdfPlainTextParser
    TEXT_FIELD_TYPES = %w[text multiline_text text_multiloc html_multiloc]
    NUMBER_FIELD_TYPES = %w[number linear_scale rating sentiment_linear_scale]
    SELECT_FIELD_TYPES = %w[select multiselect select_image multiselect_image]
    FILLED_OPTION_CHARS = %w[& ☑ ☒ >]

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
      # TODO: Personal data checkbox not working well
      # TODO: Area question not importing

      parsed_fields = {}
      field_config.each_with_index do |field, _index|
        # First get the text between the field title and the end delimiter as a broad match
        # TODO: If split does not work on title try truncated version?
        start_text = field[:print_title]
        end_text = field.dig(:content_delimiters, :end)
        field_text = extract_text_between(all_text, start_text, end_text)
        field[:text] = field_text

        # Now process the values
        value = if TEXT_FIELD_TYPES.include? field[:input_type]
          process_text_value(field)
        elsif NUMBER_FIELD_TYPES.include? field[:input_type]
          process_number_value(field)
        elsif SELECT_FIELD_TYPES.include? field[:input_type]
          process_selected_options(field, option_config)
        end
        parsed_fields[field[:name]] = value if !value.nil?
      end

      {
        pdf_pages: (1..pages.length).to_a,
        fields: parsed_fields
      }
    end

    private

    def extract_text_between(text, start_string, end_string)
      return text if start_string.blank?

      split_text = text.split(start_string).last
      end_string ? split_text.split(end_string).first : split_text
    end

    # Remove page numbers
    def remove_page_numbers(pages)
      page_copy = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.page') }
      page_number_regex = Regexp.new "#{page_copy} \\d+$"
      pages.map do |page|
        page.gsub(page_number_regex, '')&.strip
      end
    end

    def process_text_value(field)
      # First split the text within the field to narrow it down to the actual text we want to use
      start_delimiter = field.dig(:content_delimiters, :start)
      value = extract_text_between(field[:text], start_delimiter, nil)
      value.tr("\n", ' ').strip
    end

    def process_number_value(field)
      value = process_text_value(field)
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
