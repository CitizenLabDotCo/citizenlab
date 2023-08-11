# frozen_string_literal: true

require 'google/cloud/document_ai'

module BulkImportIdeas
  class GoogleFormParserService
    def initialize(pdf_file_content)
      @pdf_file_content = pdf_file_content
    end

    # TODO: Might need to get the vector stuff properly so that the text appears in the right order
    def parse_paper_form
      # return dummy_data unless ENV.fetch('GOOGLE_DOCUMENT_AI_PROJECT', false) # Temp for development

      document = process_upload

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

    # NOTE: For DEVELOPMENT ONLY when Google API not configured
    def dummy_data
      [
        {
          # User details
          'Name:' => { value: Faker::FunnyName.name, type: '' },
          'Email:' => { value: Faker::Internet.email, type: '' },
          # Core fields
          'Title:' => { value: Faker::Quote.yoda, type: '' },
          'Body:' => { value: Faker::Hipster.paragraph, type: '' },
          # Select fields
          'Yes' => { value: nil, type: %w[filled_checkbox unfilled_checkbox].sample },
          'No' => { value: nil, type: %w[filled_checkbox unfilled_checkbox].sample },
          'This' => { value: nil, type: %w[filled_checkbox unfilled_checkbox].sample },
          'That' => { value: nil, type: %w[filled_checkbox unfilled_checkbox].sample },
          # Custom text field
          'Title:' => { value: Faker::Quote.robin, type: '' }
        }
      ]
    end
  end
end
