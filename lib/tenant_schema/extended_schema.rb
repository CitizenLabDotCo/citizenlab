module TenantSchema
  class ExtendedSchema < JSON::Schema::Draft4
    def initialize
      super
      @attributes["required-settings"] = RequiredSettingsAttribute
      @uri = JSON::Util::URI.parse("http://citizenlab.co/tenant_settings_spec.json")
      @names = ["http://citizenlab.co/tenant_settings_spec.json"]
    end

    JSON::Validator.register_validator(self.new)
  end
end