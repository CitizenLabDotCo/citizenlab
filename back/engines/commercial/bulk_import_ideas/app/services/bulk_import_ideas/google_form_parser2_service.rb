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

    def parse_text(text)
      lines = text.split('/n')

      # documents is an array of documents.
      # a document is an array of fields.
      documents = []
      document = nil
      field = nil

      lines.each do |line|
        if is_new_document(line) then
          document << field unless field.nil?
          field = nil

          documents << document unless document.nil?
          document = []
        end

        if is_field_title(line) then
          document << field unless field.nil?

          field = {
            title: line,
            type: lookup_field_type(line)
          }

          next
        end

        next if field.nil?

        if field.type == 
      end
    end

    private

    def is_new_document(line)
      # Must return true if the line equals the first question,
      # or in the future some other way of determining the start
      # of the document
    end

    def is_field_title(line)
      # TODO
    end

    def lookup_field_type(line)
      # TODO
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
  end
end