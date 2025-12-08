# frozen_string_literal: true

module BulkImportIdeas::Extractors
  class UserExtractor < BaseExtractor
    def initialize(locale, config, xlsx_file_path)
      super(locale, config)
      begin
        workbook = RubyXL::Parser.parse_buffer(open("#{xlsx_file_path}/users.xlsx").read)
        @worksheet = workbook.worksheets[0]
        @rows = generate_user_rows
      rescue StandardError
        # Do nothing if the file is not found or cannot be parsed
      end
    end

    # @param [Array<Hash>] projects output of ProjectExtractor#projects
    def user_details(projects)
      users = @rows

      # SECURITY: Replace email addresses so real emails do not get added to dev or staging environments
      users = sanitize_emails(users)

      user_custom_fields = custom_fields
      users, user_custom_fields = extract_project_user_data(projects, users, user_custom_fields) if projects.any?

      [users, user_custom_fields]
    end

    private

    def custom_fields
      return [] if @rows.empty?

      # Ignore the 'special' columns that are not custom fields
      columns = @rows.flat_map(&:keys).uniq - [USER_EMAIL, USER_FULL_NAME, USER_FIRST_NAME, USER_LAST_NAME, USER_CREATED_AT, USER_LAST_ACTIVE_AT]
      generate_fields(@rows, columns, fixed_key: true)
    end

    def generate_user_rows
      data = []

      @worksheet.drop(1).each do |row|
        row_data = []
        row&.cells&.each_with_index do |cell, column_index|
          next if cell.nil? || cell.value.blank? # Skip empty or nil cells

          header = clean_string_value(@worksheet[0][column_index]&.value)
          next unless header # Skip if header is nil

          # Change some names to match our import format
          renamed_columns = @config[:renamed_columns] || {}
          header = renamed_columns[header] if renamed_columns.key?(header)

          value = clean_string_value(cell.value)
          row_data << [header, value]
        end
        next if row_data.empty? # Skip empty rows

        row_data = extract_full_name_to_first_last(row_data.to_h)
        data << row_data
      end
      data
    end

    # Phases will have some user data in the idea rows, so we need to extract that so that we can import the users first
    # Why? Because if imported using the idea importer then they won't be full users
    def extract_project_user_data(projects, users, user_custom_fields)
      projects.each do |project_data|
        project_data[:phases]&.each do |phase_data|
          if phase_data[:idea_rows].present?

            # Add any custom fields for the user if they exist in the project data
            if phase_data[:user_custom_fields].present?
              user_custom_fields.concat(phase_data[:user_custom_fields])
            end

            # Extract users from the idea rows
            phase_data[:idea_rows].each do |idea_row|
              # Ensure the idea row has an author email
              next if idea_row[USER_EMAIL].blank?

              # Create a user row if it doesn't already exist
              user_row = users.find { |u| u[USER_EMAIL] == idea_row[USER_EMAIL] }
              unless user_row
                idea_row = extract_full_name_to_first_last(idea_row)
                user_row = {
                  USER_EMAIL => idea_row[USER_EMAIL],
                  USER_FIRST_NAME => idea_row[USER_FIRST_NAME],
                  USER_LAST_NAME => idea_row[USER_LAST_NAME]
                }
                # Get custom field values from the idea row (if they exist)
                custom_field_keys = phase_data[:user_custom_fields]&.pluck(:title_multiloc)&.pluck(@locale)
                custom_field_keys&.each do |key|
                  user_row[key] = idea_row[key] if idea_row[key].present?
                end
                users << user_row
              end
            end
          end
        end
      end

      # Ensure unique custom fields by key
      # TODO: user custom fields is nil?
      user_custom_fields&.uniq! { |field| field[:key] }

      [users, user_custom_fields]
    end

    def extract_full_name_to_first_last(row)
      full_name = row[USER_FULL_NAME]&.strip
      row.delete(USER_FULL_NAME)
      return row if full_name.blank? || (row[USER_FIRST_NAME].present? && row[USER_LAST_NAME].present?)

      name_parts = full_name.split
      first_name = name_parts[0..-2].join(' ')
      last_name = name_parts[-1] || ''

      row[USER_FIRST_NAME] = first_name
      row[USER_LAST_NAME] = last_name
      row
    end

    # TODO: Custom field extraction is currently specific to EngagementHQ only

    # Split by comma, space and capital letter to handle multiselects - assumes each option starts with a capital letter
    def multiselect_regex
      /, (?=[A-Z])/
    end

    # Split by colon and comma to detect matrix fields
    def matrix_regex
      /([^:]+)\s*:\s*([^,]+)(?:,\s*|$)/
    end

    def reformat_multiselect_values(column_name, option_values)
      @rows = standardise_delimiters(@rows, column_name, option_values, ',')
    end

    def reformat_matrix_values(column_name, labels)
      @rows = standardise_delimiters(@rows, column_name, labels, ',')
    end
  end
end
