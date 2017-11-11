Apartment.configure do |config|
  config.excluded_models += ["PublicApi::ApiToken"]
end