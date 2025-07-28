# frozen_string_literal: true

# NOTE: Only supports native_survey phases at the moment

module BulkImportIdeas::Extractors
  class EngagementHqSurveyPhaseExtractor < BasePhaseExtractor

    private

    def phase_title
      @worksheet.sheet_data[0][3].value
    end

    def ideas_row_range
      # The last row is the first row where the date is empty in the 'Date Published (dd-mm-yyyy)' column (index 3)
      last_row = @worksheet.drop(4).each_with_index.find { |row, _row_index| row[3].nil? || row[3].value.blank? }&.last

      # Skip the first 4 rows which are headers and metadata
      [4, last_row]
    end

    def ideas_col_range
      [3, @worksheet[0].size - 1] # Start from column 4 (index 3) to the last column
    end

    def header_row_index(col_index)
      col_index == 3 ? 2 : 3 # Date column header is on different row!
    end

    def reformat_multiselect_values(column_name)
      update_delimiters(column_name)
    end

    def reformat_matrix_values(column_name)
      update_delimiters(column_name)
    end

    # Update values to ensure semicolons for multiselect, matrix fields, etc.
    def update_delimiters(column_name)
      @idea_rows = @idea_rows.map do |row|
        row[column_name] = row[column_name].split(/[,;]/).map(&:strip).join('; ') if row[column_name]
        row
      end
    end
  end
end
