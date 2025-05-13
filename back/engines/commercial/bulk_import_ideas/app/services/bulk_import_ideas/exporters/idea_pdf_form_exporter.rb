# frozen_string_literal: true

# @deprecated Use {IdeaPdfHtmlFileExporter} instead.
require 'prawn'
require 'prawn/measurement_extensions'
module BulkImportIdeas::Exporters
  class IdeaPdfFormExporter < BaseFormExporter
    attr_reader :participation_context, :form_fields, :previous_cursor

    delegate :generate_multiselect_instructions, to: :class
    private :generate_multiselect_instructions

    FORBIDDEN_HTML_TAGS_REGEX = %r{</?(div|span|ul|ol|li|img|a){1}[^>]*/?>}
    JUMBLING_FIELD_TYPES = %w[multiline_text html_multiloc text text_multiloc]

    def initialize(phase, locale, personal_data_enabled)
      super
      @form_fields = IdeaCustomFieldsService.new(phase.pmethod.custom_form).printable_fields
      @personal_data_enabled = personal_data_enabled
      @previous_cursor = nil
      @app_configuration = AppConfiguration.instance
      @importer_fields = []
    end

    def export
      generate_pdf.render
    end

    def format
      'pdf'
    end

    def mime_type
      'application/pdf'
    end

    def filename
      'form.pdf'
    end

    def importer_data
      {
        page_count: generate_pdf.page_count,
        fields: @importer_fields
      }
    end

    private

    def generate_pdf
      pdf = Prawn::Document.new(page_size: 'A4')

      load_font pdf

      render_tenant_logo pdf
      write_form_title pdf
      write_instructions pdf

      if @personal_data_enabled
        render_personal_data_section pdf
      end

      form_fields.each_with_index do |custom_field, i|
        field_type = custom_field.input_type

        # If this is a survey, the first field will be a 'page'.
        # Since the pdf is initialized with an empty page,
        # we can skip this.
        next if i == 0 && field_type == 'page'

        if field_type == 'page'
          pdf.start_new_page(size: 'A4')
        end

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

      logo_image = StringIO.new logo.file.read
      pdf.image logo_image
      pdf.move_down 5.mm
    end

    def write_form_title(pdf)
      phase_title = @phase.title_multiloc[@locale]
      project_title = @phase.project.title_multiloc[@locale]

      pdf.text(
        "<b>#{project_title} - #{phase_title}</b>",
        size: 18,
        inline_format: true
      )

      pdf.move_down 5.mm
    end

    def write_instructions(pdf)
      pdf.text(
        "<b>#{I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.instructions') }}</b>",
        size: 14,
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
        size: 14,
        inline_format: true
      )

      pdf.move_down 2.mm

      # Personal data explanation
      personal_data_explanation_key = if @phase.pmethod.supports_public_visibility?
        'form_builder.pdf_export.personal_data_explanation_public'
      else
        'form_builder.pdf_export.personal_data_explanation_private'
      end
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
        # Add print description to linear scale fields (if not overridden by the admin)
        if (custom_field.linear_scale? || custom_field.rating?) && custom_field.description_multiloc[@locale].blank?
          custom_field.description_multiloc[@locale] = custom_field.linear_scale_print_description(@locale)
        end

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

        pdf_group.move_down 5.mm

        case field_type
        when 'select'
          render_single_choice(pdf_group, custom_field)
        when 'multiselect'
          render_multiple_choice(pdf_group, custom_field)
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
        "<b>#{custom_field_service.handle_title(custom_field, @locale)}</b>#{custom_field.required? ? '' : " (#{optional})"}",
        size: 14,
        inline_format: true
      )
    end

    def write_description(pdf, custom_field)
      description = custom_field_service.handle_description(custom_field, @locale)
      if description.present?
        paragraphs = parse_html_tags(description)

        paragraphs.each do |paragraph|
          pdf.text(paragraph, inline_format: true)
        end
      end
    end

    def write_instructions_and_disclaimers(pdf, custom_field)
      multiselect_instructions = generate_multiselect_instructions(custom_field, @locale)
      visibility_disclaimer = generate_visibility_disclaimer(custom_field)

      if multiselect_instructions || visibility_disclaimer
        pdf.move_down 2.mm
        pdf.text("*#{multiselect_instructions}", size: 10) if multiselect_instructions
        pdf.text("*#{visibility_disclaimer}", size: 10) if visibility_disclaimer
      end
    end

    def generate_visibility_disclaimer(custom_field)
      return if !@phase.pmethod.supports_public_visibility? || custom_field.visible_to_public?

      I18n.with_locale(@locale) do
        I18n.t('form_builder.pdf_export.this_answer')
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
          pdf.text custom_field_service.handle_title(option, @locale)
        end

        pdf.move_down 4.mm
      end
      pdf.move_up 2.mm
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
          pdf.text custom_field_service.handle_title(option, @locale)
        end

        pdf.move_down 4.mm
      end
      pdf.move_up 2.mm
    end

    def render_text_lines(pdf, lines)
      lines.times do
        pdf.text '_' * 59, color: '666666', size: 20, leading: 5
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

      # In IdeaPdfFileParser#merge_idea_with_form_fields, we add :value key to this hash.
      @importer_fields << {
        name: custom_field_service.handle_title(field, @locale),
        description: type == 'field' ? ActionView::Base.full_sanitizer.sanitize(field[:description_multiloc][@locale]) : nil,
        type: type,
        input_type: field[:input_type],
        code: field[:code],
        key: key,
        parent_key: parent_key,
        page: page,
        position: position.to_i
      }
    end

    class << self
      def generate_multiselect_instructions(custom_field, locale)
        return unless custom_field.input_type == 'multiselect'

        min = custom_field.minimum_select_count
        max = custom_field.maximum_select_count
        min = nil if min == 0
        max = nil if max&.>= custom_field.options.length

        I18n.with_locale(locale) do
          if custom_field.select_count_enabled && (min || max)
            if min && max && min == max
              I18n.t('form_builder.pdf_export.choose_exactly', count: min)
            elsif min && max
              I18n.t('form_builder.pdf_export.choose_between', min: min, max: max)
            elsif min
              I18n.t('form_builder.pdf_export.choose_at_least', count: min)
            else
              I18n.t('form_builder.pdf_export.choose_at_most', count: max)
            end
          else
            I18n.t('form_builder.pdf_export.choose_as_many')
          end
        end
      end
    end
  end
end
