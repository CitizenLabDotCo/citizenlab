# frozen_string_literal: true

Apartment.configure do |config|
  config.excluded_models += ['PublicApi::ApiClient', 'CommonPassword']
end
