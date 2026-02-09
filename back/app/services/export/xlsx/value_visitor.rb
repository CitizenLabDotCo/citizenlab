module Export
  module Xlsx
    class ValueVisitor < FieldVisitorService
      VALUE_SEPARATOR = ';'

      def initialize(model, option_index, app_configuration: nil)
        super()
        @model = model
        @option_index = option_index
        @multiloc_service = MultilocService.new(app_configuration: app_configuration)
      end

      def default(field)
        value_for(field)
      end

      def visit_html(_field)
        '' # Not supported yet. Field type not used in native surveys, nor in idea forms.
      end

      def visit_text_multiloc(field)
        value_for_multiloc value_for(field)
      end

      def visit_multiline_text_multiloc(_field)
        '' # Not supported yet. Field type not used in native surveys, nor in idea forms.
      end

      def visit_html_multiloc(field)
        value = value_for(field)
        return '' if value.blank?

        translation = multiloc_service.t value
        Utils.new.convert_to_text_long_lines(translation)
      end

      def visit_select(field)
        option_value = value_for(field)
        return '' if option_value.blank?

        option_title = option_index[option_value]&.title_multiloc
        value_for_multiloc option_title
      end

      def visit_multiselect(field)
        option_values = value_for(field) || []
        return '' if option_values.empty? || !option_values.is_a?(Array)

        option_titles = option_values.filter_map do |option_value|
          option_title = option_index[option_value]&.title_multiloc
          value_for_multiloc option_title
        end
        option_titles.join(VALUE_SEPARATOR)
      end

      def visit_ranking(field)
        visit_multiselect(field)
      end

      def visit_multiselect_image(field)
        visit_multiselect(field)
      end

      def visit_checkbox(_field)
        '' # Not supported yet. Field type not used in native surveys, nor in idea forms.
      end

      def visit_date(_field)
        '' # Not supported yet. Field type not used in native surveys, nor in idea forms.
      end

      def visit_files(field)
        return built_in_files if field.code == 'idea_files_attributes'

        '' # Not supported yet. Field type not used in native surveys, nor in idea forms.
      end

      def visit_image_files(_field)
        '' # Not supported yet. Field type not used in native surveys, nor in idea forms.
      end

      def visit_point(field)
        value = value_for(field)
        return '' if value.blank?

        JSON.generate(value)
      end

      def visit_line(field)
        visit_point(field)
      end

      def visit_polygon(field)
        visit_point(field)
      end

      def visit_page(_field)
        '' # The field does not capture data, so there is no value.
      end

      def visit_section(_field)
        '' # The field does not capture data, so there is no value.
      end

      def visit_file_upload(field)
        file_id = value_for(field)['id']
        return '' unless file_id

        if (file = model.idea_files.detect { |f| f.id == file_id })
          file.file.url
        else
          file_attachment = model.file_attachments.detect { |f| f.id == file_id }
          file_attachment.file.content.url
        end
      end

      def visit_shapefile_upload(field)
        visit_file_upload(field)
      end

      def visit_topic_ids(_field)
        return '' if model.input_topics.empty?

        topic_titles = model.input_topics.map do |topic|
          value_for_multiloc topic.title_multiloc
        end
        topic_titles.join(VALUE_SEPARATOR)
      end

      def visit_cosponsor_ids(_field)
        ''
      end

      private

      attr_reader :model, :option_index, :multiloc_service

      def built_in_files
        return '' if model.idea_files.empty? && model.attached_files.empty?

        urls = model.idea_files.map { |idea_file| idea_file.file.url } +
               model.attached_files.map { |file| file.content.url }

        urls.join("\n")
      end

      def value_for(field)
        stored_value = if field.built_in?
          model.public_send field.key
        else
          model.custom_field_values[field.key]
        end
        stored_value.nil? ? '' : stored_value
      end

      def value_for_multiloc(maybe_multiloc)
        maybe_multiloc.is_a?(Hash) ? multiloc_service.t(maybe_multiloc, ignore_blank: true) : ''
      end
    end
  end
end
