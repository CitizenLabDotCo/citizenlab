# frozen_string_literal: true

require 'google/cloud/document_ai'

module BulkImportIdeas
  class GoogleFormParserService
    def initialize(pdf_path)
      @pdf_path = pdf_path
      @credentials = 'config/google_cloud.json' # Replace with the path to your Google Cloud credentials JSON file
    end

    def parse_form_fields
      client = Google::Cloud::DocumentAI.document_processor_v1beta3

      client.configure do |config|
        config.credentials = @credentials
      end

      parent = "projects/thematic-axle-394913/locations/eu" # Replace with your Google Cloud Project ID and location

      input_config = {
        gcs_source: {
          uri: @pdf_path
        },
        mime_type: 'application/pdf'
      }

      form_parser_params = {
        raw_document: {
          source: input_config
        }
      }

      request = {
        form_parser_params: form_parser_params
      }

      operation = client.process_document(parent: parent, document: request)

      operation.wait_until_done!

      if operation.error?
        raise operation.error
      end

      # Extract and format the parsed fields
      parsed_fields = operation.response.form_parser.extracted_form_fields.map do |field|
        {
          type: field.field_name.type,
          label: field.field_name.display_name,
          value: field.field_value.text_anchor.text
        }
      end

      parsed_fields
    end
  end
end
