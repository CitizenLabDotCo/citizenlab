module Frontend
  module TenantStyle
    extend ActiveSupport::Concern

    STYLE_JSON_SCHEMA_STR = ERB.new(File.read(Frontend::Engine.root.join('config','schemas','tenant_style.json_schema.erb'))).result(binding)
    STYLE_JSON_SCHEMA = JSON.parse(STYLE_JSON_SCHEMA_STR)

    included do
      validates :style, presence: true, json: {
        schema: STYLE_JSON_SCHEMA_STR,
        message: ->(errors) { errors.map{|e| {fragment: e[:fragment], error: e[:failed_attribute], human_message: e[:message]} } },
        options: {
          errors_as_objects: true
        }
      }, allow_blank: true

      before_validation :set_style
    end


    def set_style
      self.style ||= {}
    end

    module ClassMethods
      def available_style_attributes
        STYLE_JSON_SCHEMA['properties'].map do |prop, descriptor|
          {
            name: prop,
            description: descriptor["description"]
          }
        end
      end
    end
  end
end