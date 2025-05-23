# frozen_string_literal: true

# Document how this works and what calls are made

module BulkImportIdeas::Parsers
  class IdeaHtmlPdfFileParser < IdeaPdfFileParser
    # Returns an array of idea rows compatible with IdeaImporter
    # Only one row ever returned as only one PDF per idea is parsed by this service
    def parse_rows(file)
      pdf_file = file.file.read

      # We get both parsed values so we can merge the best values from both
      google_forms_service = Pdf::IdeaGoogleFormParserService.new
      google_parsed_idea = google_parsed_idea(google_forms_service, pdf_file)
      text_parsed_idea = text_parsed_idea(google_forms_service, pdf_file)

      # Merge the two types of parsed idea into one idea row
      [merge_parsed_ideas_into_idea_row(google_parsed_idea, text_parsed_idea, file)]
    end

    private

    def google_parsed_idea(google_forms_service, pdf_file)
      remove_question_numbers_in_keys(google_forms_service.parse_pdf(pdf_file))
    end

    def text_parsed_idea(google_forms_service, pdf_file)
      raw_text = google_forms_service.raw_text_page_array(pdf_file)
      Pdf::IdeaHtmlPdfPlainTextParser.new(@locale).parse_text(raw_text, template_data)
    rescue BulkImportIdeas::Error
      []
    end

    # Returns the field titles without question numbers for the google parsed ideas
    def remove_question_numbers_in_keys(parsed_idea)
      template_data[:fields].each do |field|
        parsed_idea[:fields] = parsed_idea[:fields].transform_keys { |key| key == field[:print_title] ? field[:name] : key }
      end
      parsed_idea
    end

    # NOTE: This is already done better in the text parser, but overridden here to catch anything coming back from the google form parser
    def process_text_field_value(field, all_fields)
      value = super

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

    # This data is a combination of the form_fields and the context of where those fields are in the PDF
    def template_data
      @template_data ||= BulkImportIdeas::Parsers::Pdf::IdeaHtmlPdfTemplateReader.new(@phase, @locale, @personal_data_enabled).template_data
    end
  end
end
