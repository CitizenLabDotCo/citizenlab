module BulkImportIdeas::Exporters
  class IdeaHtmlPdfFormExporter < IdeaHtmlFormExporter
    def initialize(phase, locale, personal_data_enabled)
      super

      @importer_fields = []
      # TODO: Add platform default locale to @locale in parent class

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
      html = ActionController::Base.new.render_to_string render_config

      # Render the form from HTML as a PDF using Chromium on Gotenburg
      gotenberg_url = ENV['GOTENBURG_PDF_URL'].presence || 'http://gotenberg:3000'
      ::Gotenberg::Chromium.call(gotenberg_url) do |doc|
        doc.html html
        doc.prefer_css_page_size
      end.to_binary

      # Extract the text from this PDF and add it to the @importer_fields array
      # pdf_io = StringIO.new(file)
      # pages = PDFTextProcessor.process(pdf_io)
      # puts pages
      #
      # binding.pry
    end

    # TODO: MAYBE NEED SOMETHING LIKE THIS TO GET THE EXACT POSITION OF THE TEXT IN PDF
    # https://stackoverflow.com/questions/59944941/how-to-get-the-position-coordinates-of-an-text-inside-of-a-pdf
    def importer_data
      {
        page_count: generate_pdf.page_count,
        fields: @importer_fields
      }
    end
  end
end
