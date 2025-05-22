# frozen_string_literal: true

module BulkImportIdeas::Exporters
  class IdeaHtmlPdfFormExporter < IdeaHtmlFormExporter
    def format
      'pdf'
    end

    def mime_type
      'application/pdf'
    end

    def filename
      'form.pdf'
    end

    # Render the form from HTML as a PDF using Chromium on Gotenberg container
    def export
      html = ActionController::Base.new.render_to_string render_config
      gb = GotenbergClient.new
      gb.render_to_pdf(html)
    end

    def importer_data
      # Extract the text from this PDF so we understand which pages and approx location each field is on
      file = export
      pdf_io = StringIO.new(file)
      reader = PDF::Reader.new(pdf_io)

      pages = reader.pages.map do |page|
        page.text.split("\n").map do |line|
          # Remove the optional text from each line
          line.sub("(#{I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.optional') }})", '')&.strip
        end
      end

      @importer_fields = []
      @form_fields.each do |field|
        add_to_importer_fields(field, pages, 'field')
        field.options.each do |option|
          add_to_importer_fields(option, pages, 'option')
        end
      end

      {
        page_count: reader.pages.count,
        fields: @importer_fields
      }
    end

    private

    def add_to_importer_fields(field_or_option, pdf_pages, type = 'field')
      title = custom_field_service.handle_title(field_or_option, @locale)

      pdf_pages.each_with_index do |lines, index|
        page_num = index + 1
        field_line_num = lines.find_index(title)
        total_lines = lines.length
        if field_line_num
          # Convert the line number into a position 0 - 100 in the page (equivalent of what the google form parser returns)
          position = ((field_line_num + 1) * (100 / total_lines.to_f)).round

          key = field_or_option.key
          parent_key = type == 'option' ? field_or_option.custom_field.key : nil

          # Blank out the field once found
          pdf_pages[index][lines.find_index(title)] = ''

          @importer_fields << {
            name: title,
            description: type == 'field' ? ActionView::Base.full_sanitizer.sanitize(field_or_option[:description_multiloc][@locale]) : nil,
            type: type,
            input_type: field_or_option[:input_type],
            code: field_or_option[:code],
            key: key,
            parent_key: parent_key,
            page: page_num,
            position: position.to_i
          }
        end
      end
    end

    # Dev only methods to allow rendering of images in the PDF
    def print_description(field)
      description = super
      description&.sub!('localhost:4000', 'cl-back-web:4000') # TEMP: Dev only?
    end

    def logo_url
      url = super
      url&.sub!('localhost:4000', 'cl-back-web:4000') # TEMP: Dev only?
    end
  end
end
