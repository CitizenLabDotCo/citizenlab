# frozen_string_literal: true

module XlsxExport
  class ValueVisitor < FieldVisitorService
    include HtmlToPlainText

    def initialize(model)
      super()
      @model = model
    end

    def visit_special_field_for_report(field)
      escape_formula value_for(field)
    end

    def visit_text(field)
      escape_formula value_for(field)
    end

    def visit_number(field)
      value_for(field)
    end

    def visit_multiline_text(field)
      # Not supported yet. Field type not used in native surveys, nor idea form.
    end

    def visit_html(field)
      # Not supported yet. Field type not used in native surveys, nor idea form.
    end

    def visit_text_multiloc(field)
      escape_formula MultilocService.new.t(value_for(field))
    end

    def visit_multiline_text_multiloc(field)
      # Not supported yet. Field type not used in native surveys, nor idea form.
    end

    def visit_html_multiloc(field)
      translation = MultilocService.new.t(value_for(field))
      escape_formula convert_to_text_long_lines(translation)
    end

    def visit_select(field)
      option_value = value_for(field)
      return unless option_value

      if field.code == 'domicile'
        areas = Area.all.index_by(&:id)
        escape_formula MultilocService.new.t(areas[option_value]&.title_multiloc)
      else
        option_title = options_for(field)[option_value].title_multiloc
        escape_formula MultilocService.new.t(option_title)
      end
    end

    def visit_multiselect(field)
      if field.code == 'topic_ids'
        built_in_topics
      else
        option_values = value_for(field) || []
        option_titles = option_values.map do |option_value|
          option_title = options_for(field)[option_value].title_multiloc
          MultilocService.new.t option_title
        end
        escape_formula option_titles.join(VALUE_SEPARATOR)
      end
    end

    def visit_checkbox(field)
      # Not supported yet. Field type not used in native surveys, nor idea form.
    end

    def visit_date(field)
      # Not supported yet. Field type not used in native surveys, nor idea form.
    end

    def visit_files(field)
      return built_in_files if field.code == 'idea_files_attributes'

      # Not supported yet. Field type not used in native surveys, nor idea form.
    end

    def visit_image_files(field)
      # Not supported yet. Field type not used in native surveys, nor idea form.
    end

    def visit_point(field)
      # Not supported yet. Field type not used in native surveys, nor idea form.
    end

    def visit_linear_scale(field)
      value_for(field)
    end

    private

    attr_reader :model

    VALUE_SEPARATOR = ', '

    def built_in_topics
      return if model.topics.empty?

      topic_titles = model.topics.map do |topic|
        MultilocService.new.t(topic.title_multiloc)
      end
      escape_formula topic_titles.join(VALUE_SEPARATOR)
    end

    def built_in_files
      return if model.idea_files.empty?

      model.idea_files.map { |idea_file| idea_file.file.url }.join("\n")
    end

    def value_for(field)
      if field.built_in?
        model.public_send field.key
      else
        model.custom_field_values[field.key]
      end
    end

    def options_for(field)
      @options ||= {}
      @options[field] ||= field.options.index_by(&:key)
    end

    def escape_formula(text)
      return unless text

      # After https://docs.servicenow.com/bundle/orlando-platform-administration/page/administer/security/reference/escape-excel-formula.html and http://rorsecurity.info/portfolio/excel-injection-via-rails-downloads
      if '=+-@'.include?(text.first) && !text.empty?
        "'#{text}"
      else
        text
      end
    end

    def convert_to_text_long_lines(html)
      convert_to_text(html).tr("\n", ' ')
    end
  end
end
