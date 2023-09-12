# frozen_string_literal: true

require 'google/cloud/document_ai'

module BulkImportIdeas
  class GoogleFormParserService
    def raw_text_page_array(pdf_file_content)
      return dummy_raw_text unless ENV.fetch('GOOGLE_APPLICATION_CREDENTIALS', false) # Temp for development

      document = process_upload pdf_file_content
      text = document.text

      # Try and sort the text better by location on the page
      document.pages.map do |page|
        new_text = page.paragraphs.map do |paragraph|
          x = paragraph.layout.bounding_poly.normalized_vertices[0].y.round(2)
          y = paragraph.layout.bounding_poly.normalized_vertices[0].y.round(2)
          { x: x, y: page.page_number + y, text_segments: paragraph.layout.text_anchor.text_segments }
        end
        new_text = new_text.sort { |a, b| [a[:y], a[:x]] <=> [b[:y], b[:x]] }

        new_text_string = ''
        new_text.each do |text_block|
          text_block[:text_segments].each do |segment|
            new_text_string += text[segment.start_index...segment.end_index]
          end
        end
        new_text_string
      end
    end

    private

    def process_upload(pdf_file_content)
      # Set up the DocumentAI processor.
      # TODO: Invalid location: 'eu' must match the server deployment 'us' even when the processor is set to eu?
      client = Google::Cloud::DocumentAI.document_processor_service
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
          content: pdf_file_content,
          mime_type: 'application/pdf'
        }
      )

      # Process document
      response = client.process_document request
      response.document
    end

    # NOTE: For DEVELOPMENT ONLY to avoid Google API being called - disable GOOGLE_APPLICATION_CREDENTIALS in back-secret.env
    def dummy_raw_text
      dummy_text = []
      rand(1..8).times do
        dummy_text << "Title\n#{Faker::Quote.yoda}\nDescription\n#{Faker::Hipster.paragraph}\nPage 1"
        dummy_text << "Another field\n#{Faker::Quote.robin}\nPage 2"
      end
      dummy_text
    end
  end
end
