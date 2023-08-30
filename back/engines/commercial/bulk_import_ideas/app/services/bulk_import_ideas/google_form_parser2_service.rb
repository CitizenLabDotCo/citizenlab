module BulkImportIdeas
  class GoogleFormParser2Service
    def initialize(pdf_file_content, custom_fields)
      @pdf_file_content = pdf_file_content
      @custom_fields = custom_fields
    end

    def parse_pdf
      return dummy_data unless ENV.fetch('GOOGLE_DOCUMENT_AI_PROJECT', false) # Temp for development

      document = process_upload
      parse_text document.text
    end

    def parse_text
      
    end

    private

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
  end
end