# frozen_string_literal: true

# Configures the fog storage engine
CarrierWave.configure do |config|
  config.fog_public    = true # optional, defaults to true
  config.fog_directory = ENV.fetch('AWS_S3_BUCKET')
  config.download_retry_count = 2 # retries 2 times, sleeps 5 seconds after each retry (10 seconds total)

  config.fog_credentials = {
    provider: 'AWS',
    aws_access_key_id: ENV.fetch('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key: ENV.fetch('AWS_SECRET_ACCESS_KEY'),
    region: ENV.fetch('AWS_REGION'),

    # Optional custom endpoint for S3-compatible providers (e.g. Scaleway).
    # AWS_ENDPOINT_URL_S3 is the standard SDK variable, resolved natively by
    # aws-sdk clients; fog does not read it, so we wire it manually here.
    # When unset, fog targets AWS S3.
    endpoint: ENV['AWS_ENDPOINT_URL_S3'].presence
  }.compact
end
