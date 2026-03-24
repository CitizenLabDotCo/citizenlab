# frozen_string_literal: true

module BulkImportIdeas::Parsers
  class IdeaRowMapper
    def initialize(phase:, project:, locale:, personal_data_enabled:)
      @phase = phase
      @project = project
      @locale = locale
      @personal_data_enabled = personal_data_enabled
    end

    def build_base_idea_row(fields:, file:, index:, page_range: nil)
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
      idea_row[:topic_titles] = fields[locale_tags_label].to_s.split(';').map(&:strip).compact_blank

      idea_row
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

    # Normalizes a field's value based on its input_type.
    # Callers must pass a block to handle matrix_linear_scale fields, e.g.:
    #   process_field_value(field, form_fields) { |f| extract_matrix_value(f) }
    def process_field_value(field, form_fields)
      if %w[select multiselect multiselect_image ranking].include?(field[:input_type]) && field[:value]
        values = field[:value].is_a?(Array) ? field[:value] : field[:value].to_s.split(';')
        if values.count > 0
          options = values.map do |value|
            option = form_fields.find { |f| f[:parent_key] == field[:key] && f[:name].strip == value.strip }
            option[:key] if option
          end
          field[:value] = options.compact.uniq
        else
          field[:value] = []
        end
      elsif %w[number linear_scale sentiment_linear_scale rating].include?(field[:input_type]) && field[:value].present?
        field[:value] = field[:value].to_i
      elsif field[:input_type] == 'checkbox' && field[:value].present?
        field[:value] = %w[x checked].include?(field[:value].downcase)
      elsif field[:input_type] == 'date' && field[:value].present?
        field[:value] = format_date(field[:value])
      elsif field[:input_type] == 'matrix_linear_scale' && field[:value].present?
        field[:value] = yield(field)
      else
        field[:value] = field[:value].to_s
      end

      field
    end

    def idea_blank?(fields)
      fields.each_value do |value|
        return false if value.present?
      end
      true
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

    # Processes all fields - including built in fields
    # @param [Array<Hash>] merged_fields - pre-merged fields from the parser
    # @param [Hash] idea_row - the idea row being built
    def process_custom_form_fields(merged_fields, idea_row)
      custom_fields = {}
      merged_fields.each do |field|
        next if field[:key].nil? || field[:value].nil?

        if field[:code]
          # Core fields
          idea_row[field[:code].to_sym] = field[:input_type].include?('multiloc') ? { @locale.to_sym => field[:value] } : field[:value]
        else
          # Custom fields
          value = field[:value]
          value = value.first if field[:input_type] == 'select' && value.is_a?(Array)
          custom_fields[field[:key].to_sym] = value if value.present?
        end
      end
      idea_row[:custom_field_values] = custom_fields

      idea_row
    end

    def format_date(date)
      return nil if date.blank?

      parsed_date = begin
        date.is_a?(Date) ? date : Date.parse(date)
      rescue StandardError
        nil
      end
      return nil unless parsed_date

      parsed_date.strftime('%Y-%m-%d')
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
