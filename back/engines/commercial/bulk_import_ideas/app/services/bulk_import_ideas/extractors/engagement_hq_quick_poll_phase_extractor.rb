# frozen_string_literal: true

module BulkImportIdeas::Extractors
  class EngagementHqQuickPollPhaseExtractor < EngagementHqSurveyPhaseExtractor
    private

    def header_row_index(col_index)
      [3, 4].include?(col_index) ? 2 : 3 # Date and poll question column headers are on different row!
    end
  end
end
