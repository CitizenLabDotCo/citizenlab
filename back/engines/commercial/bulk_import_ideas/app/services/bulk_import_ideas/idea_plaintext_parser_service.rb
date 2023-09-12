# frozen_string_literal: true

module BulkImportIdeas
  class IdeaPlaintextParserService
    TEXT_FIELD_TYPES = %w[text text_multiloc]
    MULTILINE_FIELD_TYPES = %w[multiline_text html_multiloc]

    FORBIDDEN_HTML_TAGS_REGEX = %r{</?(div|p|span|ul|ol|li|em|img|a){1}[^>]*/?>}
    EMPTY_SELECT_CIRCLES = ['O', '○']
    EMPTY_MULTISELECT_SQUARES = ['☐']

    def initialize(custom_fields, locale)
      @custom_fields = custom_fields
      @locale = locale

      @optional_copy = I18n.with_locale(locale) { I18n.t('form_builder.pdf_export.optional') }
      @choose_as_many_copy = I18n.with_locale(locale) { I18n.t('form_builder.pdf_export.choose_as_many') }
      @this_answer_copy = I18n.with_locale(locale) { I18n.t('form_builder.pdf_export.this_answer') }

      @page_copy = I18n.with_locale(locale) { I18n.t('form_builder.pdf_export.page') }
      @page_number_regex = Regexp.new "^#{@page_copy} \\d+$"

      @fields_by_display_title = {}

      @custom_fields.each do |field|
        title = field.title_multiloc[@locale]

        display_title = field.required? ? title : "#{title} (#{@optional_copy})"
        @fields_by_display_title[display_title] = field
      end

      # documents is an array of forms.
      # A form is a hash with the field title
      # as key, and the detected answer as value.
      # If no answer is found it is set to nil
      @documents = []
      @form = nil

      @current_field_display_title = nil
      @current_custom_field = nil
      @current_description = nil
    end

    def parse_text(pages)
      pages.each_with_index2 do |page, i|
        parse_page(page, i + 1)
      end

      @documents << @form
      @documents
    end

    def parse_page(page, page_number)
      lines = page.lines.map(&:rstrip)

      # Reset state
      @current_field_display_title = nil
      @current_custom_field = nil
      @current_description = nil

      last_index = lines.length - 1
      last_line = lines.last

      if page_number? last_line
        if new_document? last_line
          unless @form.nil?
            @documents << @form
          end

          @form = {
            pdf_pages: [],
            form_pages: [],
            fields: {}
          }
        end

        @form[:form_pages] << get_page_number(last_line)
      end

      # Add page number
      @form[:pdf_pages] << page_number

      lines.each_with_index do |line, index|
        # We skip the last line since it's the page number we already
        # dealt with
        next if index == last_index

        if @form.nil?
          raise StandardError, 'Unable to detect page number of first page'
        end

        if field_title? line
          @form[:fields][line] = nil

          @current_field_display_title = line
          @current_custom_field = lookup_field(line)

          description = @current_custom_field.description_multiloc[@locale]
          next if description.nil?

          description = description.gsub(FORBIDDEN_HTML_TAGS_REGEX, '').strip
          next if description == ''

          @current_description = description
          next
        end

        next if @current_custom_field.nil?
        next if part_of_description? line
        next if disclaimer? line

        field_type = @current_custom_field.input_type

        if TEXT_FIELD_TYPES.include? field_type
          current_text = @form[:fields][@current_field_display_title]
          @form[:fields][@current_field_display_title] = current_text.nil? ? line : "#{current_text} #{line}"
          next
        end

        if MULTILINE_FIELD_TYPES.include? field_type
          current_text = @form[:fields][@current_field_display_title]
          @form[:fields][@current_field_display_title] = current_text.nil? ? line : "#{current_text} #{line}"
          next
        end

        if field_type == 'select'
          handle_select_field(line)
        end

        if field_type == 'multiselect'
          handle_multiselect_field(line)
        end

        if field_type == 'number'
          handle_number_field(line)
        end
      end
    end

    private

    def page_number?(line)
      @page_number_regex.match? line
    end

    def new_document?(line)
      return true if line == "#{@page_copy} 1"

      page_number = get_page_number line
      form_pages = @form[:form_pages]
      last_page = form_pages[form_pages.length - 1]

      # If you were just on page 2, and now you're on
      # page 1, we will assume you went to the next document
      # but it's missing the first page
      page_number <= last_page
    end

    def get_page_number(line)
      line[@page_copy.length + 1, line.length].to_i
    end

    def field_title?(line)
      @fields_by_display_title.key? line
    end

    def lookup_field(line)
      @fields_by_display_title[line]
    end

    def disclaimer?(line)
      %W[*#{@choose_as_many_copy} *#{@this_answer_copy}].include?(line)
    end

    def part_of_description?(line)
      return false if @current_description.nil?

      stripped_line = line.strip
      line_len = stripped_line.length

      # If the line matches the first part of the description...
      if line == @current_description[0, line_len]
        # We mark this first part of the description as 'detected' by removing it from the string
        @current_description = @current_description[line_len, @current_description.length].strip
        return true
      end

      false
    end

    def handle_select_field(line)
      # So far it seems like for the answer left blank an
      # O or circle symbol is prepended. For the selected
      # answer, either nothing or a random character is used. E.g.

      # "○ A lot"
      # "① Not at all" << the answer selected on the form

      # or:
      # "O A lot" +
      # "Not at all" << the answer selected on the form

      # So for now we will detect
      # which option titles match these kind of O
      # or circle symbols, and assume the others are the
      # select answer
      unless empty_select_option? line
        value = match_selected_option(line)

        unless value.nil?
          @form[:fields][@current_field_display_title] = value

          @current_field_display_title = nil
          @current_custom_field = nil
        end
      end
    end

    def handle_multiselect_field(line)
      # The multiselect field works similar to the
      # select field, except that an empty option is indicated
      # by a little square ('☐').

      unless empty_multiselect_option? line
        value = match_selected_option(line)

        unless value.nil?
          current_field_value = @form[:fields][@current_field_display_title]

          if current_field_value.nil?
            @form[:fields][@current_field_display_title] = []
          end

          @form[:fields][@current_field_display_title] << value
        end
      end
    end

    def handle_number_field(line)
      number_str = ''

      chars0 = %w[o O]
      chars1 = %w[l i I]
      chars2 = %w[z Z]
      chars5 = %w[s S]

      line.chars.each do |char|
        if char.to_i.to_s == char
          number_str += char
        end

        if chars0.include?(char)
          number_str += '0'
        end

        if chars1.include?(char)
          number_str += '1'
        end

        if chars2.include?(char)
          number_str += '2'
        end

        if chars5.include?(char)
          number_str += '5'
        end
      end

      @form[:fields][@current_field_display_title] = number_str.to_i
    end

    def option_titles
      return nil if @current_custom_field.nil?

      supported_fields = %w[select multiselect]
      return nil unless supported_fields.include? @current_custom_field.input_type

      @current_custom_field
        .options
        .pluck(:title_multiloc)
        .pluck(@locale)
    end

    # Checks if string has format '○ option label' or 'O option label'
    def empty_select_option?(line)
      empty_option?(line, EMPTY_SELECT_CIRCLES)
    end

    def match_selected_option(line)
      line_without_first_chars = line[2, line.length - 2]

      option_titles.find do |option|
        option == line || option == line_without_first_chars
      end
    end

    def empty_multiselect_option?(line)
      empty_option?(line, EMPTY_MULTISELECT_SQUARES)
    end

    def empty_option?(line, empty_characters)
      first_character = line[0, 1]
      second_character = line[1, 1]
      rest = line[2, line.length - 2]

      return false unless empty_characters.include? first_character
      return false unless second_character == ' '

      option_titles.include? rest
    end
  end
end
