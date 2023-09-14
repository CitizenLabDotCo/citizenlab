# frozen_string_literal: true

module XlsxExport
  class ValueVisitor < FieldVisitorService
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
      return '' if option_values.empty?

      option_titles = option_values.filter_map do |option_value|
        option_title = option_index[option_value]&.title_multiloc
        value_for_multiloc option_title
      end
      option_titles.join(VALUE_SEPARATOR)
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

    def visit_point(_field)
      '' # Not supported yet. Field type not used in native surveys, nor in idea forms.
    end

    def visit_page(_field)
      '' # The field does not capture data, so there is no value.
    end

    def visit_section(_field)
      '' # The field does not capture data, so there is no value.
    end

    def visit_file_upload(field)
      file_id = value_for(field)
      return '' if file_id.blank?

      idea_file = model.idea_files.detect { |file| file.id == file_id }
      idea_file.file.url
    end

    def visit_topic_ids(_field)
      return '' if model.topics.empty?

      topic_titles = model.topics.map do |topic|
        value_for_multiloc topic.title_multiloc
      end
      topic_titles.join(VALUE_SEPARATOR)
    end

    private

    attr_reader :model, :option_index, :multiloc_service

    VALUE_SEPARATOR = ', '

    def built_in_files
      return '' if model.idea_files.empty?

      model.idea_files.map { |idea_file| idea_file.file.url }.join("\n")
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
      maybe_multiloc.is_a?(Hash) ? multiloc_service.t(maybe_multiloc) : ''
    end
  end
end
