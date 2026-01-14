# frozen_string_literal: true

# NOTE: Only supports native_survey phases at the moment

module BulkImportIdeas::Extractors
  class EngagementHqSurveyPhaseExtractor < BasePhaseExtractor
    private

    def default_phase_title
      @worksheet.sheet_data[0][3].value
    end

    def ideas_row_range
      # The last row is the first row where the date is empty in the 'Date Published (dd-mm-yyyy)' column (index 3)
      # We skip the first 4 rows which are headers and metadata
      last_row = @worksheet.each_with_index.find { |row, row_num| row_num > 3 && (row[3].nil? || row[3].value.blank?) }&.last

      # Skip the first 4 rows which are headers and metadata
      [4, last_row]
    end

    def ideas_col_range
      [3, @worksheet[3].size - 1] # Start from column 4 (index 3) to the last column index of header row
    end

    def header_row_index(col_index)
      col_index == 3 ? 2 : 3 # Date column header is on different row!
    end

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
