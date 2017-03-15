CarrierWave.configure do |config|
  config.fog_provider = 'fog/aws'
  config.fog_public     = true              # optional, defaults to true

  config.fog_credentials = {
    provider:              'AWS',                        # required
    aws_access_key_id:     'AKIAIVPAC7L3XFV4DHQA',                        # required
    aws_secret_access_key: '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',                        # required
    region:                'eu-central-1',                  # optional, defaults to 'us-east-1'
  }

  config.fog_directory    = 'cl2-tenants-development'
end

