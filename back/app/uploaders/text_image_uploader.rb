class TextImageUploader < BaseImageUploader
  class CustomDownloader < CarrierWave::Downloader::Base
    def skip_ssrf_protection?(uri)
      uri.hostname == 'localhost' && uri.port == 4000
    end
  end

  self.downloader = CustomDownloader
end
