Apartment.configure do |config|
  config.excluded_models += ["PublicApi::ApiClient", "CommonPassword"]
end