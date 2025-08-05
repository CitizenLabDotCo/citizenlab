# frozen_string_literal: true

module BulkImportIdeas::Extractors
  class EngagementHqQandaPhaseExtractor < BasePhaseExtractor
    private

    # TODO: Shares a lot with SurveyPhaseExtractor, consider refactoring to share code
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
      [3, @worksheet[4].size - 1] # Start from column 4 (index 3) to the last column index of header row
    end

    def header_row_index(col_index)
      [3, 4].include?(col_index) ? 2 : 3 # Date & Q&A question column headers are on different row!
    end

    def ignore_row?(row)
      # Ignore rows that are not public answers
      row[7].value != 'Public Answer'
    end

    def participation_method_attributes
      {
        participation_method: 'ideation',
        input_term: 'question',
        campaigns_settings: { project_phase_started: true }
      }
    end
  end
end
