CarrierWave.configure do |config|
  config.fog_provider = 'fog/aws'
  config.fog_public     = true              # optional, defaults to true

  config.fog_credentials = {
    provider:              'AWS',                        # required
    aws_access_key_id:     '***REMOVED***',                        # required
    aws_secret_access_key: '***REMOVED***,                        # required
    region:                'eu-central-1',                  # optional, defaults to 'us-east-1'
  }

  config.fog_directory    = 'cl2-tenants-development'
end

if Rails.env.test? or Rails.env.cucumber?
  CarrierWave.configure do |config|
    config.enable_processing = false
  end
end