# frozen_string_literal: true

module BulkImportIdeas::Exporters
  class IdeaPdfFormExporter < IdeaHtmlFormExporter
    # These methods are made public so they can be used by the template reader when importing
    public :printable_fields, :field_print_format, :field_has_question_number?, :optional_text

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

    private

    # Allow rendering of images in the PDF when in development
    def format_urls(description)
      new_description = super
      new_description&.sub!('localhost:4000', 'cl-back-web:4000') if Rails.env.development?
      new_description
    end
  end
end
