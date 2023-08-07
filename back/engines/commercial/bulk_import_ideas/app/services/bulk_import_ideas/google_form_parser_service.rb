# frozen_string_literal: true

require 'google/cloud/document_ai'

module BulkImportIdeas
  class GoogleFormParserService
    def initialize(pdf_path)
      @pdf_path = pdf_path
    end

    def parse_form_fields
      client = Google::Cloud::DocumentAI.document_processor_service


      # Build the resource name from the project.
      name = client.processor_path(
        project: 'thematic-axle-394913',
        location: 'us', # Invalid location: 'eu' must match the server deployment 'us'
        processor: 'e894aff43df677e0' # TODO: An ID, but where do we create this? Probably need to do with API
      )

      # Read the bytes into memory
      content = File.binread @pdf_path

      # Create request
      request = Google::Cloud::DocumentAI::V1::ProcessRequest.new(
        skip_human_review: true,
        name: name,
        raw_document: {
          content: content,
          mime_type: 'application/pdf'
        }
      )

      # Process document
      response = client.process_document request

      # Handle response
      puts response.document.text



      # Extract and format the parsed fields
      # parsed_fields = operation.response.form_parser.extracted_form_fields.map do |field|
      #   {
      #     type: field.field_name.type,
      #     label: field.field_name.display_name,
      #     value: field.field_value.text_anchor.text
      #   }
      # end
      #
      # parsed_fields
    end
  end
end
