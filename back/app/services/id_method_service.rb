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
    configured_methods = app_configuration.settings('verification', 'id_methods') || []
    configured_names = configured_methods.pluck('name')
    all_methods.select do |method|
      configured_names.include?(method.name) if method.respond_to?(:name)
    end
  end

  # Whether the method has been configured by the admin, regardless of whether
  # it can be used for identity verification. Used to gate SSO login.
  # @param [AppConfiguration] app_configuration
  # @return [Boolean]
  def configured?(app_configuration, method_name)
    configured_methods(app_configuration).include? method_by_name(method_name)
  end
end