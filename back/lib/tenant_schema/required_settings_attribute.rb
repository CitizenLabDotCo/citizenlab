module TenantSchema
  class RequiredSettingsAttribute < JSON::Schema::Attribute
    def self.validate(current_schema, data, fragments, processor, validator, options = {})
      if data.is_a?(Object) && data["enabled"] && data["allowed"] && current_schema.schema["required-settings"] - data.keys != []
        message = "The active feature '#{build_fragment(fragments)}' did not have all the required settings #{current_schema.schema['required-settings'] - data.keys}"
        validation_error(processor, message, fragments, current_schema, self, options[:record_errors])
      end
    end
  end
end