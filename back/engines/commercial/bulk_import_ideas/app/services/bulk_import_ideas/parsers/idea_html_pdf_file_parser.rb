# frozen_string_literal: true

module BulkImportIdeas::Parsers
  class IdeaHtmlPdfFileParser < IdeaPdfFileParser
    private

    def process_text_field_value(field, _all_fields)
      value = field[:value]

      # Strip out greedily scanned text from the start and end of text fields based on text strings in delimiters
      # eg next question title, form end text, end of description
      start_delimiter = field.dig(:content_delimiters, :start)
      end_delimiter = field.dig(:content_delimiters, :end)

      if start_delimiter
        split_string = value.split(start_delimiter)
        value = split_string[1] if split_string.count > 1
      end

      if end_delimiter
        split_string = value.split(end_delimiter)
        value = split_string[0] if split_string.count > 1
      end

      value.strip
    end

    def import_form_data
      @import_form_data ||= BulkImportIdeas::Exporters::IdeaHtmlPdfFormExporter.new(@phase, @locale, @personal_data_enabled).importer_data
    end

    def printable_form_fields
      @printable_form_fields ||= IdeaCustomFieldsService.new(@phase.pmethod.custom_form).printable_fields
    end
  end
end
