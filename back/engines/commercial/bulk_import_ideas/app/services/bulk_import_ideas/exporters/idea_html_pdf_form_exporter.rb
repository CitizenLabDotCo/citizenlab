module BulkImportIdeas::Exporters
  class IdeaHtmlPdfFormExporter < IdeaHtmlFormExporter
    def initialize(phase, locale, personal_data_enabled)
      super

      @importer_fields = []
      # TODO: Add platform default locale to @locale in parent class

      # Hack for getting the correct URL for the logo in local dev
      @template_values[:logo_url].sub!('localhost:4000', 'cl-back-web:4000')
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

    def render_file(html)
      # Render the form from HTML as a PDF using Gotenburg
      gotenberg_url = ENV['GOTENBURG_PDF_URL'].presence || 'http://gotenberg:3000'
      ::Gotenberg::Chromium.call(gotenberg_url) do |doc|
        doc.html html
        doc.prefer_css_page_size
      end.to_binary
    end

    def importer_data
      {
        page_count: generate_pdf.page_count,
        fields: @importer_fields
      }
    end
  end
end