# frozen_string_literal: true

require 'google/cloud/document_ai'

module BulkImportIdeas
  class GoogleFormParserService
    def initialize(pdf_file_content)
      @pdf_file_content = pdf_file_content
      @document = process_upload
    end

    def raw_text
      return dummy_raw_text unless ENV.fetch('GOOGLE_DOCUMENT_AI_PROJECT', false) # Temp for development

      text = @document.text

      # Try and sort the text better by location on the page
      new_text = []
      @document.pages.each do |page|
        page.paragraphs.each do |paragraph|
          x = paragraph.layout.bounding_poly.normalized_vertices[0].y.round(2)
          y = paragraph.layout.bounding_poly.normalized_vertices[0].y.round(2)
          new_text << { x: x, y: page.page_number + y, text_segments: paragraph.layout.text_anchor.text_segments }
        end
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

    private

    def process_upload
      return nil unless ENV.fetch('GOOGLE_DOCUMENT_AI_PROJECT', false) # Temp for development
      return unless @pdf_file_content

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
          content: @pdf_file_content,
          mime_type: 'application/pdf'
        }
      )

      # Process document
      response = client.process_document request
      response.document
    end

    # NOTE: For DEVELOPMENT ONLY when Google API not configured
    def dummy_raw_text
      "Page 1\nTitle\nMy very good idea\nDescription\nwould suggest building the\nnew swimming Pool near the\nShopping mall on Park Lane,\nIt's easily accessible location\nwith enough space\nan\nLocation (optional)\nDear shopping mall\nYour favourite name for a swimming pool (optional)\n*This answer will only be shared with moderators, and not to the public.\nThe cool pool\nHow much do you like pizza (optional)\n*This answer will only be shared with moderators, and not to the public.\nA lot\n○ Not at all\nHow much do you like burgers (optional)\n*This answer will only be shared with moderators, and not to the public.\nO A lot\nNot at all\n"
    end
  end
end
