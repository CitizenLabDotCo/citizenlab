# frozen_string_literal: true

require 'google/cloud/document_ai'

module BulkImportIdeas
  class GoogleFormParserService
    def initialize(pdf_file_content)
      @pdf_file_content = pdf_file_content
    end

    def parse_pdf
      return dummy_data unless ENV.fetch('GOOGLE_DOCUMENT_AI_PROJECT', false) # Temp for development

      document = process_upload

      binding.pry

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
      doc = []
      fields.each do |field|
        if field[:name] == fields.first[:name] && field != fields.first
          docs << doc
          doc = []
        end
        doc << field
      end
      docs << doc
      docs
    end

    def parse_text(text)
      lines = text.split('/n')

      
    end

    private

    # Utility to correct common issues - ie remove new lines as they don't seem that accurate
    def format_value(name, value)
      if name == 'Email address'
        value = value.squish.delete(' ').downcase
      end
      value&.squish
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

    # NOTE: For DEVELOPMENT ONLY when Google API not configured
    def dummy_data
      Array.new(rand(1..8)) do
        [
          # User details
          { name: 'Full name', value: Faker::FunnyName.name, type: '', page: 1, x: 0.09, y: 1.16 },
          { name: 'Email address', value: Faker::Internet.email, type: '', page: 1, x: 0.09, y: 1.24 },
          # Core fields
          { name: 'Title', value: Faker::Quote.yoda, type: '', page: 1, x: 0.09, y: 1.34 },
          { name: 'Description', value: Faker::Hipster.paragraph, type: '', page: 1, x: 0.09, y: 1.41 },
          # Select fields
          { name: 'Yes', value: nil, type: %w[filled_checkbox unfilled_checkbox].sample, page: 1, x: 0.11, y: 1.66 },
          { name: 'No', value: nil, type: %w[filled_checkbox unfilled_checkbox].sample, page: 1, x: 0.45, y: 1.66 },
          { name: 'This', value: nil, type: %w[filled_checkbox unfilled_checkbox].sample, page: 1, x: 0.11, y: 1.86 },
          { name: 'That', value: nil, type: %w[filled_checkbox unfilled_checkbox].sample, page: 1, x: 0.45, y: 1.86 },
          # Custom text field
          { name: 'Another field', value: Faker::Quote.robin, type: '', page: 2, x: 0.09, y: 2.12 }
        ]
      end
    end

    # If a text segment spans several lines, it may be stored in different text segments.
    # Doesn't seem to be the case with our forms, so not used for now
    # def layout_to_text(layout, text)
    #   layout.text_anchor.text_segments.each { |segment| text[segment.start_index.to_i..segment.end_index.to_i] }.join
    # end
  end
end
