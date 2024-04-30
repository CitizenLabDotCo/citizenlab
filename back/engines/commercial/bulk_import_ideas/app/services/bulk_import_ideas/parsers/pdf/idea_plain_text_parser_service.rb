# frozen_string_literal: true

module BulkImportIdeas::Parsers::Pdf
  class IdeaPlainTextParserService
    NUMBER_FIELD_TYPES = %w[number linear_scale]
    FILLED_OPTION_CHARS = %w[☑ ☒ >]

    # TODO: JS - Needed?
    # FORBIDDEN_HTML_TAGS_REGEX = %r{</?(div|p|span|ul|ol|li|em|img|a){1}[^>]*/?>}
    # EMPTY_SELECT_CIRCLES = ['O', '○']
    # EMPTY_MULTISELECT_SQUARES = ['☐']

    def initialize(custom_fields, locale)
      @custom_fields = custom_fields
      @locale = locale
    end

    def parse_text(pages)
      form = {
        pdf_pages: [],
        form_pages: [],
        fields: {}
      }
      pages.each_with_index do |page, i|
        page_number = i + 1
        page_fields = parse_page(page)
        form[:pdf_pages] << page_number
        form[:fields] = form[:fields].merge(page_fields)
      end

      [form]
    end

    private

    def parse_page(page)
      page = page.squish

      # TODO: Should we be doing this here? we're also doing it later?
      # Remove static content from the whole page - ' eg *This answer may be shared...'
      choose_as_many_copy = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.choose_as_many') }
      this_answer_copy = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.this_answer') }
      %W[*#{choose_as_many_copy} *#{this_answer_copy}].each do |control_content|
        page = page.gsub(control_content, '')
      end

      # Extract each field by splitting the page by each field title
      optional_copy = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.optional') }
      page_hash = {}
      page_fragment = page
      @custom_fields.reverse_each do |field|
        title = field.title_multiloc[@locale]
        title = "#{title} (#{optional_copy})" if field.required == false
        text_split = page_fragment.split(title)
        if text_split.length > 1
          field_value = process_field_value(field, text_split[1])
          page_hash[title] = field_value
          page_fragment = text_split[0]
        end
      end
      page_hash.reverse_each.to_h
    end

    def process_field_value(field, value)
      # Strip out unneeded generic text
      field_value = value.strip

      # Remove field descriptions
      description = ActionView::Base.full_sanitizer.sanitize(field.description_multiloc[@locale])
      field_value = field_value&.delete_prefix(description)&.strip if description.present?

      # Remove page numbers
      page_copy = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.page') }
      page_number_regex = Regexp.new "#{page_copy} \\d+$"
      field_value = field_value&.gsub(page_number_regex, '')&.strip

      # Process different field types
      field_type = field.input_type
      if field_type == 'select'
        field_value = handle_select_field(field, field_value)
      end

      if field_type == 'multiselect'
        field_value = handle_multiselect_field(field, field_value)
      end

      if NUMBER_FIELD_TYPES.include? field_type
        field_value = handle_number_field(field, field_value)
      end
      field_value
    end

    def handle_select_field(field, field_value)
      # if contains a tick or cross - choose this in priority order
      field.options.each do |option|
        option_title = option.title_multiloc[@locale]
        FILLED_OPTION_CHARS.each do |filled_option|
          return option_title if field_value.include? "#{filled_option} #{option_title}"
        end
      end
      nil
    end

    def handle_multiselect_field(field, field_value)
      # The multiselect field works similar to the select field, except it returns an array of values.
      option_values = []
      field.options.each do |option|
        option_title = option.title_multiloc[@locale]
        FILLED_OPTION_CHARS.each do |filled_option|
          option_values << option_title if field_value.include? "#{filled_option} #{option_title}"
        end
      end
      option_values
    end

    def handle_number_field(field, field_value)
      # Remove the auto-added description from linear scale fields
      field_value = field_value&.delete_prefix(field.linear_scale_print_description(@locale) || '')&.strip

      # Convert any characters to numbers
      chars0 = %w[o O]
      chars1 = %w[l i I]
      chars2 = %w[z Z]
      chars5 = %w[s S]

      number_str = ''
      field_value.chars.each do |char|
        number_str += char if char.to_i.to_s == char
        number_str += '0' if chars0.include?(char)
        number_str += '1' if chars1.include?(char)
        number_str += '2' if chars2.include?(char)
        number_str += '5' if chars5.include?(char)
      end

      number_str.to_i
    end
  end
end
