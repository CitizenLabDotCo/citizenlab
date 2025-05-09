# frozen_string_literal: true

module BulkImportIdeas::Exporters
  class IdeaHtmlFormExporter < BaseFormExporter
    def initialize(phase, locale, personal_data_enabled)
      super
      @personal_data_enabled = personal_data_enabled
      @form_fields = IdeaCustomFieldsService.new(@participation_method.custom_form).printable_fields
    end

    def export
      return nil if Rails.env.production? # View is only required for developing/testing the template

      ActionController::Base.new.render_to_string render_config
    end

    def format
      'html'
    end

    def mime_type
      'application/html'
    end

    private

    def render_config
      {
        template: 'bulk_import_ideas/web_api/v1/export_form',
        formats: [:html],
        layout: false,
        locals: template_values
      }
    end

    def template_values
      {
        form_title: form_title,
        fields: format_fields,
        header: form_header,
        footer: form_footer,
        personal_data: {
          enabled: @personal_data_enabled,
          heading: I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.personal_data') },
          intro: I18n.with_locale(@locale) do
            I18n.t(
              "form_builder.pdf_export.personal_data_explanation_#{personal_data_visibility}",
              organizationName: organization_name
            )
          end,
          first_name: I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.first_name') },
          last_name: I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.last_name') },
          email_address: I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.email_address') },
          checkbox: I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.by_checking_this_box', organizationName: organization_name) }
        },
        optional: I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.optional') },
        unsupported_field_text: I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.unsupported_field') },
        page_copy: I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.page') },
        font_family: font_family,
        font_config: font_config,
        font_styles: font_styles
      }
    end

    def form_title
      "#{@project.title_multiloc[@locale]} - #{@phase.title_multiloc[@locale]}"
    end

    # TODO: Get this into the default values of the custom_form model so it can be edited and not just replaced - but this is difficult
    def form_header
      form = @participation_method.custom_form
      return format_html_field(default_print_start_multiloc[@locale]) if form.print_start_multiloc == {}

      print_start = TextImageService.new.render_data_images_multiloc(form.print_start_multiloc, field: :print_end_multiloc, imageable: form)
      format_html_field(print_start[@locale])
    end

    def form_footer
      form = @participation_method.custom_form
      print_end = TextImageService.new.render_data_images_multiloc(form.print_end_multiloc, field: :print_end_multiloc, imageable: form)
      format_html_field(print_end[@locale])
    end

    def organization_name(locale = @locale)
      AppConfiguration.instance.settings('core', 'organization_name')[locale]
    end

    def personal_data_visibility
      @phase.pmethod.supports_public_visibility? ? 'public' : 'private'
    end

    def default_print_start_multiloc
      logo_url = AppConfiguration.instance.logo&.medium&.url
      configured_locales = AppConfiguration.instance.settings('core', 'locales')
      configured_locales.index_with do |locale|
        <<~HTML
          <h1><img src="#{logo_url}" alt="#{organization_name(locale)}" /></h1>
          <h1>#{form_title}</h1>
          <h2>#{I18n.with_locale(locale) { I18n.t('form_builder.pdf_export.instructions') }}</h2>
          <ul class="instructions">
          <li>#{I18n.with_locale(locale) { I18n.t('form_builder.pdf_export.write_as_clearly') }}</li>
          <li>#{I18n.with_locale(locale) { I18n.t('form_builder.pdf_export.write_in_language') }}</li>
          </ul>
        HTML
      end
    end

    def format_fields
      question_num = 0
      @form_fields.map do |field|
        {
          title: field.title_multiloc[@locale],
          description: field_print_description(field),
          question_number: field.page? || field.additional_text_question? ? nil : "#{question_num += 1}.",
          additional_text_question: field.additional_text_question?,
          format: field_print_format(field),
          input_type: field.input_type,
          instructions: multiselect_print_instructions(field),
          visibility_disclaimer: print_visibility_disclaimer(field),
          optional: !field.required?,
          options: field.options.map do |option|
            {
              id: option.id,
              title: option.title_multiloc[@locale]
            }
          end
        }
      end
    end

    def field_print_format(field)
      case field.input_type
      when 'page'
        :page
      when 'select'
        :single_select
      when 'multiselect'
        :multi_select
      when 'multiline_text', 'html_multiloc'
        :multi_line_text
      when 'text', 'text_multiloc', 'number', 'linear_scale'
        :single_line_text
      else
        # CURRENTLY UNSUPPORTED
        # rating
        # multiselect_image
        # file_upload
        # shapefile_upload
        # point
        # line
        # polygon
        # ranking
        # matrix_linear_scale
        # sentiment_linear_scale
        :unsupported
      end
    end

    # Empty method to override in PDF version of the exporter
    def format_html_field(description)
      description
    end

    def field_print_description(field)
      if (field.linear_scale? || field.rating?) && field.description_multiloc[@locale].blank? # TODO: Is rating correct here as it returns nil below (old code)
        linear_scale_print_description(field)
      else
        description = TextImageService.new.render_data_images_multiloc(field.description_multiloc, field: :description_multiloc, imageable: field)
        format_html_field(description[@locale])
      end
    end

    def linear_scale_print_description(field)
      multiloc_service = MultilocService.new

      min_text = multiloc_service.t(field.linear_scale_label_1_multiloc, @locale)
      min_label = "1#{min_text.present? ? " (#{min_text})" : ''}"

      max_text = multiloc_service.t(field.nth_linear_scale_multiloc(field.maximum), @locale)
      max_label = field.maximum.to_s + (max_text.present? ? " (#{max_text})" : '')

      I18n.with_locale(@locale) do
        I18n.t(
          'form_builder.pdf_export.linear_scale_print_description',
          min_label: min_label,
          max_label: max_label
        )
      end
    end

    def print_visibility_disclaimer(field)
      @phase.pmethod.supports_public_visibility? && field.answer_visible_to == 'admins' ? "*#{I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.this_answer') }}" : ''
    end

    def multiselect_print_instructions(field)
      return unless field.input_type == 'multiselect'

      min = field.minimum_select_count
      max = field.maximum_select_count
      min = nil if min == 0
      max = nil if max&.>= field.options.length

      message = I18n.with_locale(@locale) do
        if field.select_count_enabled && (min || max)
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
      "*#{message}"
    end

    def font_family
      default = "'Public Sans', 'Helvetica Neue', Arial, Helvetica, sans-serif"
      return default unless style['customFontName']

      "'#{style['customFontName']}', #{default}"
    end

    # Font loader config will be used only for Adobe custom fonts
    def font_config
      return if style['customFontAdobeId'].blank?

      {
        typekit: {
          id: style['customFontAdobeId']
        }
      }.to_json
    end

    # For custom font configs we must base64 embed the fonts in the document to avoid CORS issues
    def font_styles
      return unless style['customFontURL'] && style['customFontName']

      # Fetch the CSS file
      base_url = AppConfiguration.instance.base_frontend_uri
      css_url = custom_font_url(style['customFontURL'], base_url)
      css_content = Net::HTTP.get(css_url)

      # Return the CSS with the font URLs replaced with base64-encoded data URIs
      css_host = css_url.host ? "#{css_url.scheme}://#{css_url.host}" : base_url
      css_content.gsub(/url\(['"]?([^'")]+)['"]?\)/) do
        font_url = custom_font_url(::Regexp.last_match(1), css_host)
        font_data = Net::HTTP.get(font_url)
        base64_font = Base64.strict_encode64(font_data)
        "url('data:font/#{File.extname(font_url.to_s).delete('.')};base64,#{base64_font}')"
      end
    end

    # Add the hostname to the font URL if it is a relative URL
    def custom_font_url(url, host = nil)
      custom_font_url = URI.parse(url)
      if custom_font_url.host.nil? && host
        custom_font_url = URI.join(host, custom_font_url)
      end
      custom_font_url
    end

    def style
      @style ||= AppConfiguration.instance.style
    end
  end
end
