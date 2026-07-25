# frozen_string_literal: true

module McpServer
  module SpecSupport
    IMAGE_FIXTURE_PATH = Rails.root.join('spec/fixtures/female_avatar_0.jpg').freeze
    PDF_FIXTURE_PATH = Rails.root.join('spec/fixtures/minimal_pdf.pdf').freeze

    # Stubs a remote image download so Carrierwave's URL fetch returns local fixture
    # bytes. Bypasses Carrierwave's SsrfFilter (which resolves DNS itself and would
    # otherwise bypass WebMock) so the request lands on Net::HTTP. The codebase
    # prepends ProcessableUriDownloader on Carrierwave's Downloader::Base — see
    # back/config/initializers/carrierwave.rb — so we stub on that module.
    #
    # Returns the fixture path so callers can assert byte-equality on the stored file.
    def stub_remote_image_download(url, fixture_path: IMAGE_FIXTURE_PATH)
      stub_remote_download(url, fixture_path: fixture_path, content_type: 'image/jpeg')
    end

    def stub_remote_file_download(url, fixture_path: PDF_FIXTURE_PATH, content_type: 'application/pdf')
      stub_remote_download(url, fixture_path: fixture_path, content_type: content_type)
    end

    # Stubs a failing remote download (CarrierWave raises CarrierWave::DownloadError).
    def stub_failing_remote_download(url, status: 404)
      allow_any_instance_of(ProcessableUriDownloader)
        .to receive(:skip_ssrf_protection?).and_return(true)

      stub_request(:get, url).to_return(status: status)
    end

    private

    def stub_remote_download(url, fixture_path:, content_type:)
      allow_any_instance_of(ProcessableUriDownloader)
        .to receive(:skip_ssrf_protection?).and_return(true)

      stub_request(:get, url).to_return(
        status: 200,
        body: ->(_req) { fixture_path.open },
        headers: { 'Content-Type' => content_type }
      )

      fixture_path
    end
  end
end
