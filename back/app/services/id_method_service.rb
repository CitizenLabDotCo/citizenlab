# frozen_string_literal: true

class IdMethodService
  def all_methods
    @all_methods ||= IdMethods.all_methods
  end

  def all_methods_by_name
    @all_methods_by_name ||= IdMethods.all_methods_by_name
  end

  def method_by_name(name)
    all_methods_by_name[name]
  end

  # To list all the methods in admin HQ settings
  def all_methods_json_schema
    all_methods.map do |method|
      {
        type: 'object',
        title: method.name,
        required: ['name'],
        properties: {
          name: { type: 'string', enum: [method.name], default: method.name, readOnly: true },
          **method.config_parameters.to_h do |cp|
            parameter_schema = method.respond_to?(:config_parameters_schema) && method.config_parameters_schema[cp]
            [cp, parameter_schema || { type: 'string', private: 'true' }]
          end
        }
      }
    end.to_json
  end

  def configured_methods(app_configuration)
    configured_methods = app_configuration.settings('verification', 'verification_methods') || []
    configured_names = configured_methods.pluck('name')
    all_methods.select do |method|
      configured_names.include?(method.name)
    end
  end

  # Whether the method has been configured by the admin, regardless of whether
  # it can be used for identity verification. Used to gate SSO login.
  # @param [AppConfiguration] app_configuration
  # @return [Boolean]
  def configured?(app_configuration, method_name)
    configured_methods(app_configuration).include? method_by_name(method_name)
  end

  def method_metadata(method)
    allowed_for_verified_actions = method.respond_to?(:enabled_for_verified_actions?) && method&.enabled_for_verified_actions?

    name = method.respond_to?(:ui_method_name) ? method.ui_method_name : method.name

    # Attributes
    multiloc_service = MultilocService.new
    locales = AppConfiguration.instance.settings('core', 'locales')

    locked_attributes = if method.respond_to?(:locked_attributes)
      method.locked_attributes.filter_map do |code|
        multiloc_service.i18n_to_multiloc("xlsx_export.column_headers.#{code}", locales: locales)
      end
    else
      []
    end

    other_attributes = if method.respond_to?(:other_attributes)
      method.other_attributes.filter_map do |code|
        multiloc_service.i18n_to_multiloc("xlsx_export.column_headers.#{code}", locales: locales)
      end
    else
      []
    end

    # Custom fields
    custom_fields = CustomField.registration
    locked_custom_fields = if method.respond_to?(:locked_custom_fields)
      method.locked_custom_fields.filter_map { |code| custom_fields.find { |f| f.code == code.to_s }&.title_multiloc }
    else
      []
    end

    other_custom_fields = if method.respond_to?(:other_custom_fields)
      method.other_custom_fields.filter_map { |code| custom_fields.find { |f| f.code == code.to_s }&.title_multiloc }
    else
      []
    end

    {
      allowed_for_verified_actions: allowed_for_verified_actions,
      name: name,
      locked_attributes: locked_attributes,
      other_attributes: other_attributes,
      locked_custom_fields: locked_custom_fields,
      other_custom_fields: other_custom_fields
    }
  end
end
