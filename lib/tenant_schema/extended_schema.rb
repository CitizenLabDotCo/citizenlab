module TenantSchema
  class ExtendedSchema < JSON::Schema::Draft4
    # Using this in your schema will force loading the schema extension.
    SCHEMA_URL = "http://citizenlab.co/tenant_settings_spec.json"

    def initialize
      super
      @attributes["required-settings"] = RequiredSettingsAttribute
      @uri = JSON::Util::URI.parse(SCHEMA_URL)
      @names = [SCHEMA_URL]
    end

    JSON::Validator.register_validator(self.new)
  end
end