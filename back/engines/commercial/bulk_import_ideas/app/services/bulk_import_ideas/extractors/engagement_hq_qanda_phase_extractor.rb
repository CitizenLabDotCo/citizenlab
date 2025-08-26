# frozen_string_literal: true

module BulkImportIdeas::Extractors
  class EngagementHqQandaPhaseExtractor < EngagementHqSurveyPhaseExtractor
    private

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
      }
    end
  end
end
