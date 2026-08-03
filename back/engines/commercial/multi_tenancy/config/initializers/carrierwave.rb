# frozen_string_literal: true

# Configures the fog storage engine
CarrierWave.configure do |config|
  config.fog_public    = true # optional, defaults to true
  config.fog_directory = ENV.fetch('AWS_S3_BUCKET')
  config.download_retry_count = 2 # retries 2 times, sleeps 5 seconds after each retry (10 seconds total)

  # Optional custom endpoint for S3-compatible providers (e.g. Scaleway).
  # When unset, fog targets AWS S3.
  s3_endpoint = ENV['AWS_S3_ENDPOINT'].presence

  config.fog_credentials = {
    provider: 'AWS',                                           # required
    aws_access_key_id: ENV.fetch('AWS_ACCESS_KEY_ID'),         # required
    aws_secret_access_key: ENV.fetch('AWS_SECRET_ACCESS_KEY'), # required
    region: ENV.fetch('AWS_REGION'),                           # required
    endpoint: s3_endpoint,
    path_style: s3_endpoint.present?
  }.compact
end
