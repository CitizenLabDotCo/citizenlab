# frozen_string_literal: true

module BulkImportIdeas::Parsers
  class IdeaBaseFileParser
    def initialize(current_user, locale, phase_id, personal_data_enabled)
      @import_user = current_user
      @phase = Phase.find(phase_id)
      @project = @phase.project
      @locale = locale || AppConfiguration.instance.settings('core', 'locales').first # Default locale for any new users created
      @personal_data_enabled = personal_data_enabled
    end

    def parse_file(file_content)
      files = create_files file_content

      idea_rows = []
      files.each do |file|
        idea_rows += parse_rows file
      end
      idea_rows
    end

    private

    def create_files(file_content)
      [upload_source_file(file_content)]
    end

    def upload_source_file(file_content)
      file_type = file_content.index('application/pdf') ? 'pdf' : 'xlsx'
      BulkImportIdeas::IdeaImportFile.create!(
        import_type: file_type,
        project: @project,
        file_by_content: {
          name: "import.#{file_type}",
          content: file_content # base64
        }
      )
    end

    def ideas_to_idea_rows(ideas_array, file)
      idea_rows = ideas_array.each_with_index.map do |idea, index|
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

        idea_row[:id]           = index + 1
        idea_row[:file]         = file
        idea_row[:project_id]   = @project.id
        idea_row[:phase_id]     = @phase.id if @phase
        idea_row[:pdf_pages]    = page_range
        idea_row[:published_at] = fields[locale_published_label]
        idea_row[:image_url]    = fields[locale_image_url_label]
        idea_row[:latitude]     = fields[locale_latitude_label]
        idea_row[:longitude]    = fields[locale_longitude_label]
        idea_row[:topic_titles] = (fields[locale_tags_label] || '').split(';').map(&:strip).select(&:present?)

        fields = structure_raw_fields(fields)
        idea_row = process_user_details(fields, idea_row)
        idea_row = process_custom_form_fields(fields, idea_row)

        idea_row
      end
      idea_rows.compact
    end

    def idea_blank?(idea)
      idea.each do |_field, value|
        return false if value.present?
      end
      true
    end

    def structure_raw_fields(fields)
      fields.map do |name, value|
        {
          name: name,
          value: value,
          type: 'field',
          page: 1,
          position: nil
        }
      end
    end

    def process_user_details(fields, idea_row)
      # Do not add any personal details if 'Permission' field is not present or blank
      locale_permission_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.permission') }
      permission = fields.find { |f| f[:name] == locale_permission_label }
      idea_row[:user_consent] = permission && permission[:value].present?

      if idea_row[:user_consent]
        locale_email_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.email_address') }
        email = fields.find { |f| f[:name] == locale_email_label }
        email_value = email ? email[:value].gsub(/\s+/, '') : nil # Remove any spaces
        # Remove the email if it does not validate
        email_value = email_value&.match(User::EMAIL_REGEX) ? email_value : nil

        locale_first_name_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.first_name') }
        first_name = fields.find { |f| f[:name] == locale_first_name_label }
        idea_row[:user_first_name] = first_name[:value] if first_name

        locale_last_name_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.last_name') }
        last_name = fields.find { |f| f[:name] == locale_last_name_label }
        idea_row[:user_last_name] = last_name[:value] if last_name

        idea_row[:user_email] = email_value
      end

      idea_row
    end

    def merge_idea_with_form_fields(idea)
      raise NotImplementedError, 'This method is not yet implemented'
    end

    # Processes all fields - including built in fields
    def process_custom_form_fields(fields, idea_row)
      merged_fields = merge_idea_with_form_fields(fields)
      multi_select_types = %w[multiselect multiselect_image]
      custom_fields = {}
      merged_fields.each do |field|
        next if field[:key].nil? || field[:value].nil?

        if field[:code]
          # Core fields
          idea_row[field[:code].to_sym] = field[:input_type].include?('multiloc') ? { @locale.to_sym => field[:value] } : field[:value]
        else
          # Custom fields
          value = field[:value]
          value = value.compact if multi_select_types.include?(field[:input_type])
          value = value.compact.first if field[:input_type] == 'select' && value.is_a?(Array)
          custom_fields[field[:key].to_sym] = value if value.present?
        end
      end
      idea_row[:custom_field_values] = custom_fields

      idea_row
    end

    def process_field_value(field, form_fields)
      if %w[select multiselect multiselect_image].include?(field[:input_type]) && field[:value]
        values = field[:value].is_a?(Array) ? field[:value] : field[:value].split(';')
        if values.count > 0
          options = values.map do |value|
            option = form_fields.find { |f| f[:parent_key] == field[:key] && f[:name] == value.strip }
            option[:key] if option
          end
          field[:value] = options
        end
      elsif %w[number linear_scale].include?(field[:input_type]) && field[:value].present?
        field[:value] = field[:value].to_i
      end
      field
    end
  end
end
