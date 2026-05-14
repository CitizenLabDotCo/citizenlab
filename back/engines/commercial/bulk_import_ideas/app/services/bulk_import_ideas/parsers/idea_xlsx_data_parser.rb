# frozen_string_literal: true

module BulkImportIdeas::Parsers
  class IdeaXlsxDataParser
    def initialize(current_user, locale, phase_id, personal_data_enabled)
      @xlsx_parser = IdeaXlsxFileParser.new(current_user, locale, phase_id, personal_data_enabled)
    end

    # Handles data in the format returned by XlsxService.new.xlsx_to_hash_array instead of a file path
    def parse_rows(hash_array)
      @xlsx_parser.ideas_to_idea_rows(hash_array, nil)
    end
  end
end
