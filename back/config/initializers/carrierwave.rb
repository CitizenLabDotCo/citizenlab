require './lib/carrierwave/file_base64/adapter.rb'

CarrierWave.configure do |config|
  config.fog_public     = true              # optional, defaults to true

  config.fog_credentials = {
    provider:              'AWS',                        # required
    aws_access_key_id:     ENV.fetch('AWS_ACCESS_KEY_ID'),                        # required
    aws_secret_access_key: ENV.fetch('AWS_SECRET_ACCESS_KEY'),                        # required
    region:                ENV.fetch('AWS_REGION'),                  # optional, defaults to 'us-east-1'
  }

  config.fog_directory    = ENV.fetch('AWS_S3_BUCKET')
end

if Rails.env.test? or Rails.env.cucumber?
  CarrierWave.configure do |config|
    config.enable_processing = false
  end
end

# Adds the mount_base64_file_uploader class method to ActiveRecord.
ActiveSupport.on_load :active_record do
  ActiveRecord::Base.extend Carrierwave::FileBase64::Adapter
end
