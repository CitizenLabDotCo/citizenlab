# frozen_string_literal: true

module BulkImportIdeas::Parsers
  class IdeaHtmlPdfFileParser < IdeaPdfFileParser
    # Currently this is the only difference - we just get the import data from a different exporter
    def import_form_data
      @import_form_data ||= BulkImportIdeas::Exporters::IdeaHtmlPdfFormExporter.new(@phase, @locale, @personal_data_enabled).importer_data
    end
  end
end
