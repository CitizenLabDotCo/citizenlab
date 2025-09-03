# frozen_string_literal: true

module BulkImportIdeas::Legacy
  class IdeaPlainTextParserService
    NUMBER_FIELD_TYPES = %w[number linear_scale rating]
    SELECT_FIELD_TYPES = %w[select multiselect multiselect_image]
    FILLED_OPTION_CHARS = %w[☑ ☒ >]
    EMPTY_OPTION_CHARS = %w[O ○ ☐]

    def initialize(custom_fields, locale)
      @custom_fields = custom_fields
      @locale = locale
    end

    def parse_text(pages)
      idea = {
        pdf_pages: [],
        fields: {}
      }
      pages.each_with_index do |page, i|
        page_number = i + 1
        page_fields = parse_page(page)
        idea[:pdf_pages] << page_number
        idea[:fields] = idea[:fields].merge(page_fields)
      end
      idea
    end

    private

    def parse_page(page)
      page = page.squish # Remove new lines and extra whitespace

      # Remove static content from the whole page - 'eg *This answer may be shared...'
      this_answer_copy = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.this_answer') }
      page = page.gsub("*#{this_answer_copy}", '')

      # Extract each field by splitting the page by each field title
      optional_copy = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.optional') }
      page_hash = {}
      page_fragment = page
      @custom_fields.reverse_each do |field|
        title = field.title_multiloc[@locale]
        next if title.blank?

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
      # Remove static instructions
      instructions_copy = BulkImportIdeas::Legacy::IdeaPdfFormExporter.generate_multiselect_instructions(field, @locale)
      value = value.gsub("*#{instructions_copy}", '') if instructions_copy

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
      if SELECT_FIELD_TYPES.include? field_type
        field_value = handle_select_field(field, field_value)
      end

      if NUMBER_FIELD_TYPES.include? field_type
        field_value = handle_number_field(field, field_value)
      end
      field_value
    end

    # Extract selected options
    def handle_select_field(field, field_value)
      option_values = []

      # First throw out any options that are not filled
      field_value = reject_empty_options(field_value, field.options)

      field.options.each do |option|
        option_title = option.title_multiloc[@locale]

        # Now match clearly known filled option characters
        FILLED_OPTION_CHARS.each do |char|
          filled_option_text = "#{char} #{option_title}"
          if field_value.include? filled_option_text
            option_values << option_title
            field_value = field_value.gsub(filled_option_text, '').squish
          end
        end
      end

      # Now match any that are not prefixed with a character
      # ONLY for select field AND ONLY if nothing concrete has been matched
      # these seem to usually be selected for select fields
      if field.input_type == 'select' && option_values.empty?
        field.options.each do |option|
          option_title = option.title_multiloc[@locale]
          if field_value.include? option_title
            option_values << option_title
            field_value = field_value.gsub(option_title, '').squish
          end
        end
      end

      # Single select should only return the first option if more than one has been detected
      if field.input_type == 'select'
        option_values.first
      else
        option_values
      end
    end

    def reject_empty_options(field_value, options)
      options.each do |option|
        option_title = option.title_multiloc[@locale]
        EMPTY_OPTION_CHARS.each do |empty_option|
          field_value = field_value.gsub("#{empty_option} #{option_title}", '')
        end
      end

      field_value.squish
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
