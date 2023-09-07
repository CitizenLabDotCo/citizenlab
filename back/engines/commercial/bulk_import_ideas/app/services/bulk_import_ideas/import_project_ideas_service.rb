# frozen_string_literal: true

module BulkImportIdeas
  class ImportProjectIdeasService < ImportIdeasService
    def initialize(current_user, project_id, locale, phase_id)
      super(current_user)
      @project = Project.find(project_id)
      @phase = phase_id ? @project.phases.find(phase_id) : TimelineService.new.current_phase(@project)
      @form_fields = IdeaCustomFieldsService.new(Factory.instance.participation_method_for(@phase || @project).custom_form).submittable_fields
      @locale = locale || @locale
    end

    def generate_example_xlsx
      locale_name_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.full_name') }
      locale_email_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.email_address') }
      locale_permission_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.permission') }
      locale_published_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.date_published') }

      columns = {
        locale_name_label => 'Bill Test',
        locale_email_label => 'bill@citizenlab.co',
        locale_permission_label => 'X',
        locale_published_label => '18-07-2022'
      }

      ignore_columns = %w[idea_files_attributes idea_images_attributes]
      @form_fields.each do |field|
        next if field.input_type == 'section' || field.input_type == 'page' || ignore_columns.include?(field.code)

        column_name = field.title_multiloc[@locale]
        value = case field.input_type
        when 'select'
          field.options.first.title_multiloc[@locale]
        when 'multiselect'
          field.options.map { |o| o.title_multiloc[@locale] }.join '; '
        when 'topic_ids'
          @project.allowed_input_topics.map { |t| t.title_multiloc[@locale] }.join '; '
        when 'number'
          5
        else
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
        end
        columns[column_name] = value
      end

      locale_image_url_label = I18n.with_locale(@locale) { I18n.t('xlsx_export.column_headers.image_url') }
      locale_latitude_label = I18n.with_locale(@locale) { I18n.t('xlsx_export.column_headers.latitude') }
      locale_longitude_label = I18n.with_locale(@locale) { I18n.t('xlsx_export.column_headers.longitude') }

      columns[locale_image_url_label] = 'https://cl2-seed-and-template-assets.s3.eu-central-1.amazonaws.com/images/people_in_meeting_graphic.png'
      columns[locale_latitude_label] = 50.5035
      columns[locale_longitude_label] = 6.0944

      XlsxService.new.hash_array_to_xlsx [columns]
    end

    def parse_idea_rows(file, file_type)
      ideas = if file_type == 'pdf'
        parse_pdf_ideas(file)
      else
        parse_xlsx_ideas(file).map { |idea| { pdf_pages: [1], fields: idea } }
      end
      ideas_to_idea_rows(ideas)
    end

    def ideas_to_idea_rows(ideas_array)
      idea_rows = ideas_array.map do |idea|
        page_range = idea[:pdf_pages]
        fields = idea[:fields]

        next if idea_blank? fields

        idea_row = {}

        # Fields not in the idea/survey form
        locale_published_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.date_published') }
        locale_image_url_label = I18n.with_locale(@locale) { I18n.t('xlsx_export.column_headers.image_url') }
        locale_latitude_label = I18n.with_locale(@locale) { I18n.t('xlsx_export.column_headers.latitude') }
        locale_longitude_label = I18n.with_locale(@locale) { I18n.t('xlsx_export.column_headers.longitude') }
        locale_tags_label = I18n.with_locale(@locale) { I18n.t('custom_fields.ideas.topic_ids.title') }

        idea_row[:project_id]   = @project.id
        idea_row[:phase_id]     = @phase.id if @phase
        idea_row[:pdf_pages]    = page_range
        idea_row[:published_at] = fields[locale_published_label]
        idea_row[:image_url]    = fields[locale_image_url_label]
        idea_row[:latitude]     = fields[locale_latitude_label]
        idea_row[:longitude]    = fields[locale_longitude_label]
        idea_row[:topic_titles] = (fields[locale_tags_label] || '').split(';').map(&:strip).select(&:present?)

        fields = clean_field_names(fields)
        idea_row = process_user_details(fields, idea_row)
        idea_row = process_custom_form_fields(fields, idea_row)

        idea_row
      end
      idea_rows.compact
    end

    private

    # Match all fields in the custom field by the text of their label in the specified locale
    def process_custom_form_fields(doc, idea_row)
      core_field_codes = %w[title_multiloc body_multiloc location_description]
      text_field_types = %w[text multiline_text number]
      select_field_types = %w[select multiselect]

      core_fields = []
      text_fields = []
      select_fields = []
      select_options = []
      @form_fields.each do |field|
        if core_field_codes.include? field[:code]
          core_fields << { name: field[:title_multiloc][@locale], code: field[:code], type: field[:input_type] }
        elsif text_field_types.include? field[:input_type]
          text_fields << { name: field[:title_multiloc][@locale], key: field[:key], type: field[:input_type] }
        elsif select_field_types.include? field[:input_type]
          select_fields << { name: field[:title_multiloc][@locale], key: field[:key], type: field[:input_type] }
          field.options.each do |option|
            select_options << { name: option[:title_multiloc][@locale], key: option[:key], field_key: field[:key], field_type: field[:input_type] }
          end
        end
      end

      # Core fields
      idea_row = extract_core_fields idea_row, doc, core_fields

      # Custom fields
      custom_fields = {}
      custom_fields = extract_custom_text_fields custom_fields, doc, text_fields
      custom_fields = extract_custom_select_fields custom_fields, doc, select_fields, select_options
      idea_row[:custom_field_values] = custom_fields

      idea_row
    end

    def extract_core_fields(idea_row, doc, core_fields)
      core_fields.each do |field|
        core_field = find_field(doc, field[:name])
        if core_field
          code = field[:code]
          value = core_field[:value]
          idea_row[code.to_sym] = field[:type].include?('multiloc') ? { @locale.to_sym => value } : value
          doc.delete_if { |f| f == core_field }
        end
      end
      idea_row
    end

    # Text & Number fields
    def extract_custom_text_fields(custom_fields, doc, text_fields)
      text_fields.each do |field|
        text_field = find_field(doc, field[:name])
        if text_field
          custom_fields[field[:key].to_sym] = (field[:type] == 'number' ? text_field[:value].to_i : text_field[:value])
          doc.delete_if { |f| f == text_field }
        end
      end
      custom_fields
    end

    # Single & Multiselect fields
    def extract_custom_select_fields(custom_fields, doc, select_fields, select_options)
      select_fields.each do |field|
        select_field = find_field(doc, field[:name])
        if select_field && select_field[:value]
          values = select_field[:value].is_a?(Array) ? select_field[:value] : select_field[:value].split(';')
          if values.count > 0
            if field[:type] == 'select'
              value = values[0].strip # Only use the first value for single fields
              option = select_options.find { |f| f[:field_key] == field[:key] && f[:name] == value }
              custom_fields[field[:key].to_sym] = option[:key] if option
            else
              options = []
              values.each do |select_value|
                option = select_options.find { |f| f[:field_key] == field[:key] && f[:name] == select_value.strip }
                options << option[:key] if option
              end
              custom_fields[field[:key].to_sym] = options
            end
          end
          doc.delete_if { |f| f == select_field }
        end
      end
      custom_fields
    end

    def find_field(doc, name)
      doc.find { |f| f[:name] == name }
    end

    def clean_field_names(idea)
      locale_optional_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.optional') }
      idea = idea.map { |k, v| { name: k, value: v } } # Temp: Need to just use in this format
      idea.map { |f| { name: f[:name].gsub("(#{locale_optional_label})", '').squish, value: f[:value], type: f[:type], page: f[:page], x: f[:x], y: f[:y] } }
    end

    def process_user_details(doc, idea_row)
      # Do not add any personal details if 'Permission' field is not present or blank
      locale_permission_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.permission') }
      permission = find_field(doc, locale_permission_label)
      if permission && permission[:value].present?
        locale_name_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.full_name') }
        name = find_field(doc, locale_name_label)
        idea_row[:user_name] = name[:value] if name

        # Ignore any emails that don't validate
        locale_email_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.email_address') }
        email = find_field(doc, locale_email_label)
        idea_row[:user_email] = email[:value] if email && email[:value].match(User::EMAIL_REGEX)
      end

      idea_row
    end
  end
end
