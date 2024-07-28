module CustomMaps
  module GeojsonExport
    class GeojsonValueVisitor < FieldVisitorService
      def initialize(model, option_index, app_configuration: nil)
        super()
        @model = model
        @option_index = option_index
        @multiloc_service = MultilocService.new(app_configuration: app_configuration)
      end

      def default(field)
        value_for(field)
      end

      def visit_text(field)
        value_for(field)
      end

      def visit_multiline_text(field)
        value_for(field)
      end

      def visit_select(field)
        option_value = value_for(field)
        return nil if option_value.blank?

        option_title = option_index[option_value]&.title_multiloc
        value_for_multiloc option_title
      end

      def visit_multiselect(field)
        option_values = value_for(field) || []
        return nil if option_values.empty?

        option_values.filter_map do |option_value|
          option_title = option_index[option_value]&.title_multiloc
          value_for_multiloc option_title
        end
      end

      def visit_multiselect_image(field)
        visit_multiselect(field)
      end

      def visit_file_upload(field)
        file = value_for(field)

        return nil if file.nil? || file['id'].blank?

        file_id = file['id']
        idea_file = model.idea_files.detect { |f| f.id == file_id }
        idea_file.file.url
      end

      def visit_point(field)
        value_for(field)
      end

      def visit_line(field)
        value_for(field)
      end

      def visit_polygon(field)
        value_for(field)
      end

      private

      attr_reader :model, :option_index, :multiloc_service

      def value_for(field)
        return model.public_send field.key if field.built_in?

        model.custom_field_values[field.key]
      end

      def value_for_multiloc(maybe_multiloc)
        maybe_multiloc.is_a?(Hash) ? multiloc_service.t(maybe_multiloc) : ''
      end
    end
  end
end
