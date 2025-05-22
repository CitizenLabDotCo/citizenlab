# frozen_string_literal: true

module BulkImportIdeas::Exporters
  class IdeaHtmlFormExporter < BaseFormExporter
    def initialize(phase, locale, personal_data_enabled)
      super
      @personal_data_enabled = personal_data_enabled
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

    def printable_fields
      @printable_fields ||= IdeaCustomFieldsService.new(@participation_method.custom_form).printable_fields
    end

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
        optional: optional_text,
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
      return format_urls(default_print_start_multiloc[@locale]) if form.print_start_multiloc == {}

      print_start = TextImageService.new.render_data_images_multiloc(form.print_start_multiloc, field: :print_end_multiloc, imageable: form)
      format_urls(print_start[@locale])
    end

    def form_footer
      form = @participation_method.custom_form
      print_end = TextImageService.new.render_data_images_multiloc(form.print_end_multiloc, field: :print_end_multiloc, imageable: form)
      format_urls(print_end[@locale])
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

    def optional_text
      "(#{I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.optional') }})"
    end

    def format_fields
      question_num = 0
      fields = printable_fields.filter_map do |field|
        next if field.title_multiloc[@locale].blank?

        {
          id: field.id,
          title: field_print_title(field),
          description: field_print_description(field),
          question_number: field_has_question_number?(field) ? "#{question_num += 1}." : '',
          additional_text_question: field.additional_text_question?,
          format: field_print_format(field),
          input_type: field.input_type,
          visibility_disclaimer: print_visibility_disclaimer(field),
          optional: !field.required?,
          options: field.options.map do |option|
            {
              id: option.id,
              title: option.title_multiloc[@locale],
              image_url: option_image_url(field, option)
            }
          end,
          matrix: field_matrix_details(field),
          map_url: field_map_url(field)
        }
      end

      group_fields(fields)
    end

    def option_image_url(field, option)
      return nil unless field.support_option_images? && option.image

      format_urls(option.image.image.versions[:large].url)
    end

    # Group fields together so that the first question of a page appears on the same printed page as the question
    # Otherwise each question is in a group of it's own
    def group_fields(fields)
      fields.each_with_index do |field, index|
        field[:field_group] = {}
        if field[:input_type] == 'page'
          # If the next field is not a page, then do not end the field group
          field[:field_group][:start] = true
          field[:field_group][:end] = !fields[index + 1] || fields[index + 1][:input_type] == 'page'
        else
          # Don't start a field group if the previous field was a page (group starts with the page)
          field[:field_group][:start] = fields[index - 1][:input_type] != 'page'
          field[:field_group][:end] = true
        end
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
      when 'multiselect_image'
        :multi_select_image
      when 'multiline_text', 'html_multiloc'
        :multi_line_text
      when 'text', 'text_multiloc', 'number', 'linear_scale', 'rating', 'sentiment_linear_scale'
        :single_line_text
      when 'ranking'
        :ranking
      when 'matrix_linear_scale'
        :matrix_linear_scale
      when 'point', 'line', 'polygon'
        field_map_url(field) ? :mapping : :unsupported
      else
        # CURRENTLY UNSUPPORTED
        # file_upload
        # shapefile_upload
        :unsupported
      end
    end

    # Empty method to override in PDF version of the exporter - where URLs need to be changed
    def format_urls(description)
      description
    end

    def field_print_title(field)
      custom_field_service.handle_title(field, @locale)
    end

    def field_print_description(field)
      description = TextImageService.new.render_data_images_multiloc(field.description_multiloc, field: :description_multiloc, imageable: field)
      html = format_urls(description[@locale]) || ''
      html += linear_scale_print_instructions(field)
      html += sentiment_linear_scale_print_instructions(field)
      html += rating_print_instructions(field)
      html += select_print_instructions(field)
      html += multiselect_print_instructions(field)
      html += ranking_print_instructions(field)
      html += matrix_print_instructions(field)
      html += map_print_instructions(field)
      html
    end

    def field_has_question_number?(field)
      !field.page? && !field.additional_text_question?
    end

    def field_map_url(field)
      return unless %w[point line polygon page].include? field.input_type
      return if field.input_type == 'page' && field.page_layout != 'map'

      # Use map config from field > project > platform in that order
      map_config = field.map_config || @project.map_config
      zoom = map_config&.zoom_level&.to_f || platform_map_config['zoom_level'].to_f
      longitude = map_config&.center&.x || platform_map_config.dig('map_center', 'long')
      latitude = map_config&.center&.y || platform_map_config.dig('map_center', 'lat')
      tile_provider = map_config&.tile_provider || platform_map_config['tile_provider']
      return unless tile_provider&.include?('api.maptiler.com') # Means we do not currently support the wien.gv.at tile provider

      # Extract the key from the tile provider URL
      key = tile_provider.match(/key=([^&]+)/)[1]
      return unless key

      # TODO: Can we do anything with layers?

      # Use the static map API with basic maps to generate an image (even if the tile provider is not using basic)
      "https://api.maptiler.com/maps/basic/static/#{longitude},#{latitude},#{zoom}/650x420@2x.png?key=#{key}&attribution=bottomleft"
    end

    def map_print_instructions(field)
      messages = {
        'point' => 'form_builder.pdf_export.point_print_description',
        'line' => 'form_builder.pdf_export.line_print_description',
        'polygon' => 'form_builder.pdf_export.polygon_print_description'
      }
      message_id = messages[field.input_type]
      return '' unless field_map_url(field) && message_id

      "<p><em>#{I18n.with_locale(@locale) { I18n.t(message_id) }}</em></p>"
    end

    def linear_scale_print_instructions(field)
      return '' unless field.input_type == 'linear_scale'

      multiloc_service = MultilocService.new

      min_text = multiloc_service.t(field.linear_scale_label_1_multiloc, @locale)
      min_label = "1#{min_text.present? ? " (#{min_text})" : ''}"

      max_text = multiloc_service.t(field.nth_linear_scale_multiloc(field.maximum), @locale)
      max_label = field.maximum.to_s + (max_text.present? ? " (#{max_text})" : '')

      description = I18n.with_locale(@locale) do
        I18n.t(
          'form_builder.pdf_export.linear_scale_print_description',
          min_label: min_label,
          max_label: max_label
        )
      end

      format_instructions(description)
    end

    def sentiment_linear_scale_print_instructions(field)
      return '' unless field.input_type == 'sentiment_linear_scale'

      description = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.sentiment_linear_scale_print_description') }

      multiloc_service = MultilocService.new
      min_label = multiloc_service.t(field.linear_scale_label_1_multiloc, @locale)
      neutral_label = multiloc_service.t(field.linear_scale_label_3_multiloc, @locale)
      max_label = multiloc_service.t(field.linear_scale_label_5_multiloc, @locale)

      if min_label && neutral_label && max_label
        label_text = I18n.with_locale(@locale) do
          I18n.t(
            'form_builder.pdf_export.sentiment_linear_scale_print_labels',
            min_label: min_label,
            neutral_label: neutral_label,
            max_label: max_label
          )
        end
        description += " <br>#{label_text}"
      end

      format_instructions(description)
    end

    def rating_print_instructions(field)
      return '' unless field.input_type == 'rating'

      description = I18n.with_locale(@locale) do
        I18n.t(
          'form_builder.pdf_export.rating_print_description',
          max_stars: field.maximum
        )
      end

      format_instructions(description)
    end

    def ranking_print_instructions(field)
      return '' unless field.input_type == 'ranking'

      max_rank = field.options.length
      description = I18n.with_locale(@locale) do
        I18n.t(
          'form_builder.pdf_export.ranking_print_description',
          max_rank: max_rank
        )
      end

      format_instructions(description)
    end

    def print_visibility_disclaimer(field)
      @phase.pmethod.supports_public_visibility? && !field.visible_to_public? ? "*#{I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.this_answer') }}" : ''
    end

    def select_print_instructions(field)
      return '' unless field.singleselect?

      "*#{I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.select_print_description') }}"
    end

    def multiselect_print_instructions(field)
      return '' unless field.multiselect?

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
      format_instructions("*#{message}")
    end

    def field_matrix_details(field)
      return unless field.supports_matrix_statements?

      {
        statements: field.matrix_statements.map { |statement| field_print_title(statement) },
        labels: (1..field.maximum).map do |i|
          field["linear_scale_label_#{i}_multiloc"][@locale]
        end,
        label_width: 70 / field.maximum # 70% of the printed width for the labels, 30% for the statements
      }
    end

    def matrix_print_instructions(field)
      return '' unless field.supports_matrix_statements?

      description = I18n.with_locale(@locale) do
        I18n.t('form_builder.pdf_export.matrix_print_description')
      end

      format_instructions(description)
    end

    def format_instructions(instructions)
      return '' if instructions.blank?

      "<p><em>#{instructions}</em></p>"
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

    def platform_map_config
      @platform_map_config ||= AppConfiguration.instance.settings('maps')
    end
  end
end
