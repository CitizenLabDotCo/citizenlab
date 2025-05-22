# frozen_string_literal: true

module BulkImportIdeas::Parsers
  class IdeaHtmlPdfFileParser < IdeaPdfFileParser
    def import_form_data
      @import_form_data ||= BulkImportIdeas::Exporters::IdeaHtmlPdfFormExporter.new(@phase, @locale, @personal_data_enabled).importer_data
    end

    private

    def printable_form_fields
      @printable_form_fields ||= IdeaCustomFieldsService.new(@phase.pmethod.custom_form).printable_fields
    end
  end
end
