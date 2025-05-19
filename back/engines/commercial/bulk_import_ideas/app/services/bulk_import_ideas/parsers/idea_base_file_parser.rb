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

    # Default is real time import of ideas
    def parse_file(file_content)
      files = create_files file_content

      idea_rows = []
      files.each do |file|
        idea_rows += parse_rows file
      end
      idea_rows
    end

    # Asynchronous version is not implemented by default
    def parse_file_async(file_content)
      raise NotImplementedError, 'This method is not implemented'
    end

    def parse_rows(file)
      raise NotImplementedError, 'This method is not implemented'
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
        idea_to_idea_row(idea, file, index: index)
      end
      idea_rows.compact
    end

    def idea_to_idea_row(idea, file, index: 0)
      page_range = idea[:pdf_pages]
      fields = idea[:fields]

      return nil if idea_blank? fields

      # Fields not in the idea/survey form
      locale_published_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.date_published') }
      locale_image_url_label = I18n.with_locale(@locale) { I18n.t('xlsx_export.column_headers.image_url') }
      locale_latitude_label = I18n.with_locale(@locale) { I18n.t('xlsx_export.column_headers.latitude') }
      locale_longitude_label = I18n.with_locale(@locale) { I18n.t('xlsx_export.column_headers.longitude') }
      locale_tags_label = I18n.with_locale(@locale) { I18n.t('custom_fields.ideas.topic_ids.title') }

      idea_row = {}
      idea_row[:id]           = index
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
      process_custom_form_fields(fields, idea_row)
    end

    def idea_blank?(idea)
      idea.each_value do |value|
        return false if value.present?
      end
      true
    end

    def structure_raw_fields(fields)
      fields.map do |name, value|
        name = Export::Xlsx::Utils.new.remove_duplicate_column_name_suffix name
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
      locale_permission_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.permission') }
      locale_email_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.email_address') }
      locale_first_name_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.first_name') }
      locale_last_name_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.last_name') }

      # Do not add any personal details if 'Permission' field is not present or is blank
      permission = fields.find { |f| f[:name] == locale_permission_label }
      idea_row[:user_consent] = permission && permission[:value].present?
      if idea_row[:user_consent]

        # Add email but only if it validates
        email = fields.find { |f| f[:name] == locale_email_label }
        idea_row[:user_email] = email ? fix_email_address(email[:value]) : nil

        first_name = fields.find { |f| f[:name] == locale_first_name_label }
        idea_row[:user_first_name] = first_name[:value] if first_name

        last_name = fields.find { |f| f[:name] == locale_last_name_label }
        idea_row[:user_last_name] = last_name[:value] if last_name
      end

      # Delete all the user fields as they are not needed later
      fields.delete_if { |f| f[:name] == locale_permission_label }
      fields.delete_if { |f| f[:name] == locale_email_label }
      fields.delete_if { |f| f[:name] == locale_first_name_label }
      fields.delete_if { |f| f[:name] == locale_last_name_label }

      idea_row
    end

    def merge_idea_with_form_fields(fields)
      raise NotImplementedError, 'This method is not yet implemented'
    end

    # Processes all fields - including built in fields
    # @param [Array<Hash>] fields - comes from #structure_raw_fields
    # @param [Hash] idea_row - comes from #ideas_to_idea_rows
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
        values = field[:value].is_a?(Array) ? field[:value] : field[:value].to_s.split(';')
        if values.count > 0
          options = values.map do |value|
            option = form_fields.find { |f| f[:parent_key] == field[:key] && f[:name] == value.strip }
            option[:key] if option
          end
          field[:value] = options
        end
      elsif %w[number linear_scale sentiment_linear_scale rating].include?(field[:input_type]) && field[:value].present?
        field[:value] = field[:value].to_i
      else
        field[:value] = field[:value].to_s
      end

      field
    end

    def fix_email_address(email)
      email = email.gsub(/\s+/, '') # Remove any white space
      email = email.tr(',', '.') # Fix any commas that should be dots
      return email if email&.match(User::EMAIL_REGEX)

      # Try and fix common email domain suffixes
      email = email.gsub(/(couk|govuk)$/, '.\1') # Double domain suffixes
      email = email.gsub(/(com|co|org|gov|uk|fr|be|nl|de|cl|us|dk|ca|at|nu)$/, '.\1') # Single domain suffixes

      email&.match(User::EMAIL_REGEX) ? email : nil
    end
  end
end
