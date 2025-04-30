# frozen_string_literal: true

module BulkImportIdeas::Exporters
  class IdeaHtmlPdfFormExporter < IdeaHtmlFormExporter
    def initialize(phase, locale, personal_data_enabled)
      super

      # Hack for getting the correct URL for the logo in local dev
      @template_values[:logo_url]&.sub!('localhost:4000', 'cl-back-web:4000')
    end

    def format
      'pdf'
    end

    def mime_type
      'application/pdf'
    end

    def filename
      'form.pdf'
    end

    def export
      # Render the form from HTML as a PDF using Chromium on Gotenburg
      html = ActionController::Base.new.render_to_string render_config
      gotenberg_url = ENV['GOTENBURG_PDF_URL'].presence || 'http://gotenberg:3000'
      ::Gotenberg::Chromium.call(gotenberg_url) do |doc|
        doc.html html
        doc.prefer_css_page_size
      end.to_binary
    end

    # TODO: MAYBE NEED SOMETHING LIKE THIS TO GET THE EXACT POSITION OF THE TEXT IN PDF
    # https://stackoverflow.com/questions/59944941/how-to-get-the-position-coordinates-of-an-text-inside-of-a-pdf
    def importer_data
      # Extract the text from this PDF so we understand which pages each field are on
      file = export
      pdf_io = StringIO.new(file)
      reader = PDF::Reader.new(pdf_io)

      pages = reader.pages.map do |page|
        page.text.split("\n").map do |line|
          # Remove the optional text from each line - maybe need to do from the end of the line?
          line.sub("(#{ I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.optional') }})", '')&.strip
        end
      end

      @importer_fields = []

      # TODO: What about multiline titles?
      # TODO: Need to add in the options too
      @form_fields.each do |field|
        add_to_importer_fields(field, pages,'field')
        field.options.each do | option |
          add_to_importer_fields(option, pages,'option')
        end
      end

      {
        page_count: reader.pages.count,
        fields: @importer_fields
      }
    end

    def add_to_importer_fields(field_or_option, pdf_pages, type = 'field')
      title = custom_field_service.handle_title(field_or_option, @locale)

      pdf_pages.each_with_index do |lines, index|
        page_num = index + 1
        field_line_num = lines.find_index(title)
        _total_lines = lines.length
        if field_line_num
          position = field_line_num # TODO: Convert the position into equivalent of what form parser returns
          # position = (810 - position) / 8.1 # Convert the position into equivalent of what form parser returns
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
  end
end
