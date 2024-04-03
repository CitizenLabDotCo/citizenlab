# frozen_string_literal: true

module BulkImportIdeas
  class Error < StandardError
    def initialize(key, params = {})
      super()
      @key = key
      @params = params
    end

    attr_reader :key, :params
  end

  class IdeaBaseFileParser
    POSITION_TOLERANCE = 10 # TODO: JS - move to PDF parser

    def initialize(current_user, locale, phase_id, personal_data_enabled)
      @import_user = current_user
      @phase = Phase.find(phase_id)
      @project = @phase.project
      @participation_method = Factory.instance.participation_method_for(@phase)
      @form_fields = IdeaCustomFieldsService.new(@participation_method.custom_form).importable_fields
      @locale = locale || AppConfiguration.instance.settings('core', 'locales').first # Default locale for any new users created
      @google_forms_service = nil
      @input_form_data = import_form_data(personal_data_enabled)
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
      IdeaImportFile.create!(
        import_type: file_type,
        project: @project,
        file_by_content: {
          name: "import.#{file_type}",
          content: file_content # base64
        }
      )
    end

    def idea_blank?(idea)
      idea.each do |_field, value|
        return false if value.present?
      end
      true
    end

    def ideas_to_idea_rows(ideas_array)
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

    # Match all fields in the forms field with values returned by parser / xlsx sheet
    # TODO: Split this method for PDF
    def process_custom_form_fields(idea, idea_row)
      # Merge the form fields with the import values into a single array
      merged_idea = []
      form_fields = @input_form_data[:fields]
      form_fields.each do |form_field|
        idea.each do |idea_field|
          if form_field[:name] == idea_field[:name]
            if form_field[:type] == 'field'
              new_field = form_field
              new_field[:value] = idea_field[:value]
              new_field = process_field_value(new_field, form_fields)
              merged_idea << new_field
              idea.delete_if { |f| f == idea_field }
              break
            elsif idea_field[:value] == 'filled_checkbox' && form_field[:page] == idea_field[:page]
              # Check that the value is near to the position on the page it should be
              if idea_field[:position].between?(form_field[:position].to_i - POSITION_TOLERANCE, form_field[:position].to_i + POSITION_TOLERANCE)
                select_field = merged_idea.find { |f| f[:key] == form_field[:parent_key] } || form_fields.find { |f| f[:key] == form_field[:parent_key] }.clone
                select_field[:value] = select_field[:value] ? select_field[:value] << form_field[:key] : [form_field[:key]]
                merged_idea << select_field
                idea.delete_if { |f| f == idea_field }
                form_fields.delete_if { |f| f == idea_field } if select_field[:input_type] == 'select'
                break
              end
            end
          end
        end
      end

      # Now add to the idea row
      custom_fields = {}
      merged_idea.each do |field|
        next if field[:key].nil?

        if field[:code]
          # Core fields
          idea_row[field[:code].to_sym] = field[:input_type].include?('multiloc') ? { @locale.to_sym => field[:value] } : field[:value]
        else
          # Custom fields
          value = field[:value]
          value = value.compact if field[:input_type] == 'multiselect'
          value = value.compact.first if field[:input_type] == 'select' && value.is_a?(Array)
          custom_fields[field[:key].to_sym] = value if value.present?
        end
      end
      idea_row[:custom_field_values] = custom_fields

      idea_row
    end

    def process_field_value(field, form_fields)
      if %w[select multiselect].include?(field[:input_type]) && field[:value]
        values = field[:value].is_a?(Array) ? field[:value] : field[:value].split(';')
        if values.count > 0
          options = values.map do |value|
            option = form_fields.find { |f| f[:parent_key] == field[:key] && f[:name] == value.strip }
            option[:key] if option
          end
          field[:value] = options
        end
      elsif field[:input_type] == 'number'
        field[:value] = field[:value].to_i
      end
      field
    end

    def clean_field_names(idea)
      locale_optional_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.optional') }
      idea = extract_permission_checkbox(idea)
      idea.map do |name, value|
        option = name.match(/(.*)_(\d*).(\d*).(\d{2})/) # Is this an option (checkbox)?
        {
          name: option ? option[1] : name.gsub("(#{locale_optional_label})", '').squish,
          value: value,
          type: value.to_s.include?('checkbox') ? 'option' : 'field',
          page: option ? option[2].to_i : nil,
          position: option ? option[4].to_i : nil
        }
      end
    end

    def extract_permission_checkbox(idea)
      # Truncate the checkbox label for better multiline checkbox detection
      permission_checkbox_label = (I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.by_checking_this_box') })[0..30]
      checkbox = idea.select { |key, value| key.match(/^#{permission_checkbox_label}/) && value == 'filled_checkbox' }
      idea['Permission'] = 'X' if checkbox != {}
      idea
    end

    def process_user_details(doc, idea_row)
      # Do not add any personal details if 'Permission' field is not present or blank
      locale_permission_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.permission') }
      permission = doc.find { |f| f[:name] == locale_permission_label }
      idea_row[:user_consent] = permission && permission[:value].present?

      # Remove consent if any email does not validate
      if idea_row[:user_consent]
        locale_email_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.email_address') }
        email = doc.find { |f| f[:name] == locale_email_label }
        email_value = email ? email[:value].gsub(/\s+/, '') : nil # Remove any spaces
        idea_row[:user_consent] = email_value ? email_value.match(User::EMAIL_REGEX) : false
      end

      if idea_row[:user_consent]
        locale_first_name_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.first_name') }
        first_name = doc.find { |f| f[:name] == locale_first_name_label }
        idea_row[:user_first_name] = first_name[:value] if first_name

        locale_last_name_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.last_name') }
        last_name = doc.find { |f| f[:name] == locale_last_name_label }
        idea_row[:user_last_name] = last_name[:value] if last_name

        idea_row[:user_email] = email_value
      end

      idea_row
    end
  end
end
