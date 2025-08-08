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

    def users
      @rows
    end

    def custom_fields
      return [] if @rows.empty?

      columns = @rows.flat_map(&:keys).uniq - %w[Email FirstName LastName DateCreated LastAccess]
      generate_fields(@rows, columns, fixed_key: true)
    end

    private

    def generate_user_rows
      data = []

      @worksheet.drop(1).each do |row|
        row_data = []
        row&.cells&.each_with_index do |cell, column_index|
          next if cell.nil? || cell.value.blank? # Skip empty or nil cells

          header = clean_string_value(@worksheet[0][column_index]&.value)
          next unless header # Skip if header is nil

          value = clean_string_value(cell.value)
          row_data << [header, value]
        end
        row_data = row_data.to_h
        data << row_data
      end
      data
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
