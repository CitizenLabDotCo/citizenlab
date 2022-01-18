# frozen_string_literal: true

require 'carrierwave/file_base64/adapter'

CarrierWave.configure { |config| config.enable_processing = false } if Rails.env.test? || Rails.env.cucumber?

# Adds the mount_base64_file_uploader class method to ActiveRecord.
ActiveSupport.on_load :active_record do
  ActiveRecord::Base.extend Carrierwave::FileBase64::Adapter
end

module ProcessableUriDownloader
  # Patch to solve Carrierwave issue with parsing URLs.
  #
  # Before removing, please first make sure the following
  # steps succeed:
  #   1. Download the file from 
  #      https://res.cloudinary.com/citizenlabco/image/upload/v1630939376/Visio%CC%81n_2028_de_Metro_Plan_Estrate%CC%81gico_A_a9ylnk.pdf
  #   2. Do not change the file name!
  #   3. Upload it as an attachment of an idea, on a real 
  #      Citizenlab platform (not localhost).
  #   4. Get the corresponding file URL (e.g. 
  #      my_idea_file.file_url). Do not use the Cloudinary
  #      URL instead (the issue is not reproducible with
  #      that URL)!
  #   5. Create a new idea file with this URL set with 
  #      remote_file_url=.
  #   6. Use save! to save the file. You can remove this
  #      patch on success.
  #
  # Related issue: https://github.com/carrierwaveuploader/carrierwave/issues/2415
  # However, they claim the issue is now solved on the
  # master branch, but this is not the case when executing
  # the steps mentioned above.
  def process_uri uri
    URI.parse uri
  rescue URI::InvalidURIError, Addressable::URI::InvalidURIError
    raise CarrierWave::DownloadError, "couldn't parse URL: #{uri}"
  end
end

CarrierWave::Downloader::Base.prepend(ProcessableUriDownloader)
