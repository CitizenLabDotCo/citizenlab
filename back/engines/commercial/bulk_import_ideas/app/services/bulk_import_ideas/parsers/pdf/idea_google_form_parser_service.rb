# frozen_string_literal: true

require 'google/cloud/document_ai'

module BulkImportIdeas::Parsers::Pdf
  class IdeaGoogleFormParserService
    def initialize
      @document = nil
    end

    # Read the idea PDF into array of raw text per page
    def raw_text_page_array(pdf_file_content)
      @document ||= process_upload pdf_file_content
      text = @document.text

      # Try and sort the text better by location on the page
      @document.pages.map do |page|
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

    # Read the idea PDF into an idea using the Google Document AI API
    def parse_pdf(pdf_file_content)
      @document ||= process_upload pdf_file_content

      # Gets an array of all fields on all pages
      fields = []
      @document.pages.each do |page|
        page.form_fields.each do |field|
          field_name = field.field_name&.text_anchor&.content&.strip&.squish
          field_value = field.field_value.text_anchor&.content&.strip&.squish
          f = {
            name: field_name,
            value: field_value,
            type: field.value_type,
            page: page.page_number,
            x: field.field_name.bounding_poly.normalized_vertices[0].x.round(2),
            y: page.page_number + field.field_name.bounding_poly.normalized_vertices[0].y.round(2),
            position: (page.page_number + field.field_name.bounding_poly.normalized_vertices[0].y).to_s[0..3]
          }
          fields << f
        end
      end

      # Now reorder 'fields' by y then x field placement in the doc
      fields = fields.sort { |a, b| [a[:y], a[:x]] <=> [b[:y], b[:x]] }

      # Then add these fields to an idea
      idea = { pdf_pages: [], fields: {} }
      previous_page = 1
      page_count = 0
      fields.each do |field|
        current_page = field[:page]
        page_count += 1 if current_page != previous_page

        # Include field y, position in doc + position in form values in name to allow checkbox values to be used multiple times
        position = "#{page_count + 1}.#{field[:position]}"
        field_name = field[:type].include?('checkbox') ? "#{field[:name]}_#{position}" : field[:name].to_s
        idea[:fields][field_name] = field[:type].include?('checkbox') ? field[:type] : field[:value]
        idea[:pdf_pages] << field[:page] unless idea[:pdf_pages].include? field[:page]
        previous_page = field[:page]
      end
      idea
    end

    private

    def process_upload(pdf_file_content)
      # Set up the DocumentAI processor.
      location = ENV.fetch('GOOGLE_DOCUMENT_AI_LOCATION')
      client = Google::Cloud::DocumentAI.document_processor_service do |config|
        config.endpoint = "#{location}-documentai.googleapis.com"
        config.channel_args = {
          'grpc.max_receive_message_length' => 8 * 1024 * 1024,
          'grpc.max_send_message_length' => 8 * 1024 * 1024
        }
      end

      name = client.processor_path(
        location: location,
        project: ENV.fetch('GOOGLE_DOCUMENT_AI_PROJECT'),
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
  end
end
