module CustomMaps
  class CustomFieldForGeojson
    delegate :key, :input_type, :accept, to: :custom_field

    def initialize(custom_field)
      @custom_field = custom_field
      @app_configuration = AppConfiguration.instance
      @multiloc_service = MultilocService.new(app_configuration: @app_configuration)
    end

    def value_from(model)
      visitor = GeojsonValueVisitor.new(model, option_index, app_configuration: @app_configuration)
      visitor.visit self
    end

    private

    attr_reader :custom_field

    def option_index
      @option_index ||= custom_field.options.index_by(&:key)
    end
  end
end
