# frozen_string_literal: true

require 'google/cloud/document_ai'

module BulkImportIdeas::Pdf
  class IdeaGoogleFormParserService
    def initialize
      @document = nil
    end

    def raw_text_page_array(pdf_file_content)
      return dummy_raw_text unless ENV.fetch('GOOGLE_APPLICATION_CREDENTIALS', false) # Temp for development

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

    def parse_pdf(pdf_file_content, form_pages_count)
      return dummy_parsed_data unless ENV.fetch('GOOGLE_APPLICATION_CREDENTIALS', false) # Temp for development

      @document ||= process_upload pdf_file_content

      # Gets an array of all fields on all pages
      fields = []
      @document.pages.each do |page|
        page.form_fields.each do |field|
          field_name = format_name field.field_name&.text_anchor&.content&.strip
          field_value = field.field_value.text_anchor&.content&.strip
          f = {
            name: field_name,
            value: format_value(field_name, field_value),
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

      # Then split into separate ideas based on the number of pages in the PDF form (form_pages_count)
      ideas = []
      idea = { form_pages: [], pdf_pages: [], fields: {} }
      previous_page = 1
      page_count = 0
      fields.each do |field|
        current_page = field[:page]
        page_count += 1 if current_page != previous_page
        if page_count == form_pages_count # split by pages count
          ideas << idea
          idea = { form_pages: [], pdf_pages: [], fields: {} }
          page_count = 0
        end

        # Include field y, position in doc + position in form values in name to allow checkbox values to be used multiple times
        position = "#{page_count + 1}.#{field[:position]}"
        field_name = field[:type].include?('checkbox') ? "#{field[:name]}_#{position}" : field[:name].to_s
        idea[:fields][field_name] = field[:type].include?('checkbox') ? field[:type] : field[:value]
        idea[:pdf_pages] << field[:page] unless idea[:pdf_pages].include? field[:page]
        idea[:form_pages] << (page_count + 1) unless idea[:form_pages].include?(page_count + 1)
        previous_page = field[:page]
      end
      ideas << idea
      ideas
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

    # NOTE: For DEVELOPMENT ONLY to avoid Google API being called - disable GOOGLE_APPLICATION_CREDENTIALS in back-secret.env
    def dummy_raw_text
      dummy_text = []
      rand(1..8).times do
        dummy_text << "Title\n#{Faker::Quote.yoda}\nDescription\n#{Faker::Hipster.paragraph}\nPage 1"
        dummy_text << "Another field\n#{Faker::Quote.robin}\nPage 2"
      end
      dummy_text
    end

    def dummy_parsed_data
      Array.new(rand(1..8)) do
        [
          form_pages: [],
          pdf_pages: [1, 2],
          fields: {
            'First name' => Faker::FunnyName.name,
            'Last name' => Faker::FunnyName.name,
            'Email address' => Faker::Internet.email,
            'Title' => Faker::Quote.yoda,
            'Description' => Faker::Hipster.paragraph,
            'Yes_1.82' => %w[filled_checkbox unfilled_checkbox].sample,
            'No_1.82' => %w[filled_checkbox unfilled_checkbox].sample,
            'Another field' => Faker::Quote.robin
          }
        ]
      end
    end
  end
end
