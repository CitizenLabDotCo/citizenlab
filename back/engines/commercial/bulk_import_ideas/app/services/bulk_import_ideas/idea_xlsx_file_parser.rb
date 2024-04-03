# frozen_string_literal: true

module BulkImportIdeas
  class IdeaXlsxFileParser < IdeaBaseFileParser
    def parse_rows(file)
      xlsx_ideas = parse_xlsx_ideas(file).map { |idea| { pdf_pages: [1], fields: idea } }
      ideas_to_idea_rows(xlsx_ideas)
    end

    private

    def parse_xlsx_ideas(file)
      xlsx_file = URI.open(file.file_content_url)
      XlsxService.new.xlsx_to_hash_array xlsx_file
    end

    def import_form_data(personal_data_enabled)
      IdeaXlsxFormExporter.new(@phase, @locale, personal_data_enabled).importer_data
    end
  end
end
