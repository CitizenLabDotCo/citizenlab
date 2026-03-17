# frozen_string_literal: true

module BulkImportIdeas::Parsers
  class IdeaXlsxDataParser
    def initialize(current_user, locale, phase_id, personal_data_enabled)
      @xlsx_parser = IdeaXlsxFileParser.new(current_user, locale, phase_id, personal_data_enabled)
    end

    # Override the parse_rows method to handle data in the format returned by XlsxService.new.xlsx_to_hash_array instead of a file path
    def parse_rows(hash_array)
      xlsx_ideas = hash_array.map { |idea| { pdf_pages: [1], fields: idea } }
      @xlsx_parser.row_mapper.ideas_to_idea_rows(xlsx_ideas, nil)
    end
  end
end
