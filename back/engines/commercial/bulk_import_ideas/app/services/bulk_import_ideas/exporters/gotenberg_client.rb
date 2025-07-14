# frozen_string_literal: true

module BulkImportIdeas::Exporters
  class GotenbergClient
    def initialize
      @api_url = ENV.fetch('GOTENBURG_PDF_URL', 'http://gotenberg:3000')
    end

    # Use Gotenberg web service (separate docker container) to render html to PDF
    def render_to_pdf(html)
      return false unless up?

      payload = {
        'preferCssPageSize' => true,
        'generateDocumentOutline' => true, 
        'generateTaggedPdf' => true,
        'index.html' => Faraday::Multipart::FilePart.new(
          StringIO.new(html),
          'text/html; charset=utf-8',
          'index.html'
        )
      }
      url = "#{@api_url}/forms/chromium/convert/html"

      conn = Faraday.new(url) do |f|
        f.request :multipart, flat_encode: true
        f.adapter :net_http
      end
      response = conn.post(url, payload)

      output_pdf = Tempfile.new(['gotenberg', '.pdf'])
      output_pdf.binmode
      output_pdf.write(response.body)
      output_pdf.rewind

      output_pdf
    end

    private

    # Is the Gotenberg service up and running?
    def up?
      uri = URI.parse("#{@api_url}/health")
      request = Net::HTTP::Get.new(uri)
      req_options = { use_ssl: uri.scheme == 'https' }
      response = Net::HTTP.start(uri.hostname, uri.port, req_options) do |http|
        http.request(request)
      end

      response.code == '200' && JSON.parse(response.body)['status'] == 'up'
    rescue StandardError
      false
    end
  end
end
