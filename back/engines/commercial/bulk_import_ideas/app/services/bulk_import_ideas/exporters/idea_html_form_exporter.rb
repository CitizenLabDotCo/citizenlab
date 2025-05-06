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
      organization_name = AppConfiguration.instance.settings('core', 'organization_name')[@locale]
      personal_data_visibility = @phase.pmethod.supports_public_visibility? ? 'public' : 'private'

      {
        locale: @locale,
        phase: @phase,
        project: @project,
        fields: format_fields,
        instructions: {
          title: I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.instructions') },
          bullet1: I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.write_as_clearly') },
          bullet2: I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.write_in_language') }
        },
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
        logo_url: logo_url,
        page_copy: I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.page') },
        font_family: font_family,
        font_config: font_config,
        font_styles: font_styles
      }
    end

    def logo_url
      AppConfiguration.instance.logo&.medium&.url
    end

    def format_fields
      @form_fields.map do |field|
        {
          title: field.title_multiloc[@locale],
          description: print_description(field),
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

    def print_description(field)
      if (field.linear_scale? || field.rating?) && field.description_multiloc[@locale].blank? # TODO: Is rating correct here as it returns nil below (old code)
        linear_scale_print_description(field)
      else
        description = TextImageService.new.render_data_images_multiloc(field.description_multiloc, field: :description_multiloc, imageable: field)
        description[@locale]
      end
    end

    def linear_scale_print_description(field)
      multiloc_service = MultilocService.new

      min_text = multiloc_service.t(field.linear_scale_label_1_multiloc, @locale)
      min_label = "1#{min_text.present? ? " (#{min_text})" : ''}"

      max_text = multiloc_service.t(field.nth_linear_scale_multiloc(maximum), @locale)
      max_label = maximum.to_s + (max_text.present? ? " (#{max_text})" : '')

      I18n.with_locale(locale) do
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

    def style
      @style ||= AppConfiguration.instance.style
    end

    def font_family
      # TODO: Do we need to configure Public Sans somewhere?
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
  end
end
