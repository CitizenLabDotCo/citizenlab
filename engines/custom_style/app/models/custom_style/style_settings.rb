# frozen_string_literal: true

module CustomStyle
  module StyleSettings
    extend ActiveSupport::Concern

    included do
      validates :style, presence: true, json: {
        schema: self.style_json_schema_str,
        message: ->(errors) { errors.map { |e| { fragment: e[:fragment], error: e[:failed_attribute], human_message: e[:message] } } },
        options: {
          errors_as_objects: true
        }
      }, allow_blank: true

      before_validation :ensure_style
    end

    def style(*path)
      value = read_attribute(:style)
      path.blank? ? value : value.dig(*path)
    end

    def ensure_style
      self.style ||= {}
    end

    module ClassMethods
      def available_style_attributes
        style_json_schema['properties'].map do |prop, descriptor|
          {
            name: prop,
            description: descriptor['description']
          }
        end
      end

      def style_json_schema_str
        style_schema_filepath = Rails.root.join('engines/custom_style/config/schemas/style.schema.json')
        @style_json_schema_str ||= File.read(style_schema_filepath)
      end

      def style_json_schema
        @style_json_schema ||= JSON.parse(style_json_schema_str)
      end
    end
  end
end
