# frozen_string_literal: true

class GotenbergClient
  class FileTypeUnsupportedError < StandardError; end
  class GotenbergServiceUnavailableError < StandardError; end

  def initialize
    @api_url = ENV.fetch('GOTENBURG_PDF_URL', 'http://gotenberg:3000')
  end

  # Use Gotenberg web service (separate docker container) to render html to PDF
  def render_html_to_pdf(html)
    raise GotenbergServiceUnavailableError unless up?

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

  def render_libreoffice_to_pdf(file, content_type, file_name)
    raise GotenbergServiceUnavailableError unless up?
    raise FileTypeUnsupportedError unless supported_by_libreoffice?(file)

    url = "#{@api_url}/forms/libreoffice/convert"
    payload = {
      'files' => Faraday::Multipart::FilePart.new(file, content_type)
    }

    conn = Faraday.new(url) do |f|
      f.request :multipart, flat_encode: true
      f.adapter :net_http
    end

    response = conn.post(url, payload)

    output_pdf = Tempfile.new([file_name, '.pdf'])
    output_pdf.binmode
    output_pdf.write(response.body)
    output_pdf.rewind

    output_pdf
  end

  def supported_by_libreoffice?(file)
    # According to https://gotenberg.dev/docs/routes#office-documents-into-pdfs-route
    supported_extensions = %w[
      .123 .602 .abw .bib .bmp .cdr .cgm .cmx .csv .cwk .dbf .dif .doc .docm .docx .dot .dotm .dotx .dxf .emf .eps .epub .fodg .fodp .fods .fodt .fopd .gif .htm .html .hwp .jpeg .jpg .key .ltx .lwp .mcw .met .mml .mw .numbers .odd .odg .odm .odp .ods .odt .otg .oth .otp .ots .ott .pages .pbm .pcd .pct .pcx .pdb .pdf .pgm .png .pot .potm .potx .ppm .pps .ppt .pptm .pptx .psd .psw .pub .pwp .pxl .ras .rtf .sda .sdc .sdd .sdp .sdw .sgl .slk .smf .stc .std .sti .stw .svg .svm .swf .sxc .sxd .sxg .sxi .sxm .sxw .tga .tif .tiff .txt .uof .uop .uos .uot .vdx .vor .vsd .vsdm .vsdx .wb2 .wk1 .wks .wmf .wpd .wpg .wps .xbm .xhtml .xls .xlsb .xlsm .xlsx .xlt .xltm .xltx .xlw .xml .xpm .zabw
    ]

    ext =
      if file.respond_to?(:path)
        File.extname(file.path).downcase
      elsif file.is_a?(String)
        File.extname(file).downcase
      else
        raise ArgumentError, 'Unsupported file type for extension check'
      end

    supported_extensions.include?(ext)
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
