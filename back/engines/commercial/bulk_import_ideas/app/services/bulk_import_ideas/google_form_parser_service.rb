# frozen_string_literal: true

require 'google/cloud/document_ai'

module BulkImportIdeas
  class GoogleFormParserService
    def initialize(pdf_file_content)
      @pdf_file_content = pdf_file_content
    end

    def parse_paper_form
      document = process_upload

      # TODO: Need to get the vector stuff properly so that the text appears in the right order
      # TODO: Checkbox names

      # Gets an array of all fields on all pages
      fields = []
      document.pages.each do |page|
        page.form_fields.each do |field|
          field_name = format_name field.field_name&.text_anchor&.content&.strip
          field_value = field.field_value.text_anchor&.content&.strip
          f = {
            name: field_name,
            value: format_value(field_name, field_value),
            type: field.value_type,
            page: page.page_number,
            x: field.field_name.bounding_poly.normalized_vertices[0].x.round(2),
            y: page.page_number + field.field_name.bounding_poly.normalized_vertices[0].y.round(2)
          }
          fields << f
        end
      end

      # Now reorder 'fields' by y then x field placement in the doc
      fields = fields.sort { |a, b| [a[:y], a[:x]] <=> [b[:y], b[:x]] }

      # Then split into separate docs based on the first field
      docs = []
      doc = {}
      fields.each do |field|
        if field[:name] == fields.first[:name] && field != fields.first
          docs << doc
          doc = {}
        end
        doc[field[:name]] = field
      end
      docs << doc
      docs
    end

    private

    def format_value(name, value)
      if name == 'Email:'
        value = value.delete(' ').downcase
      end
      value
    end

    def format_name(name)
      name.squish
    end

    def process_upload
      client = Google::Cloud::DocumentAI.document_processor_service

      # Build the resource name from the project.
      # TODO: Invalid location: 'eu' must match the server deployment 'us' even when the processor is set to eu?
      name = client.processor_path(
        project: ENV.fetch('GOOGLE_DOCUMENT_AI_PROJECT'),
        location: ENV.fetch('GOOGLE_DOCUMENT_AI_LOCATION'),
        processor: ENV.fetch('GOOGLE_DOCUMENT_AI_PROCESSOR')
      )

      # Create request
      request = Google::Cloud::DocumentAI::V1::ProcessRequest.new(
        skip_human_review: true,
        name: name,
        raw_document: {
          content: @pdf_file_content,
          mime_type: 'application/pdf'
        }
      )

      # Process document
      response = client.process_document request
      response.document
    end

    # TODO: This is not used at the moment - might need a version to get more accurate text scanning
    def layout_to_text(layout, text)
      # If a text segment spans several lines, it will
      # be stored in different text segments.

      layout.text_anchor.text_segments.map do |segment|
        text[segment.start_index..segment.end_index]
      end.join
    end
  end
end
