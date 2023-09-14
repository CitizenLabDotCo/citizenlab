# frozen_string_literal: true

module XlsxExport
  class CustomFieldForReport
    delegate :key, :input_type, :accept, to: :custom_field

    def initialize(custom_field, scope = nil)
      @custom_field = custom_field
      @scope = scope
      @app_configuration = AppConfiguration.instance
      @multiloc_service = MultilocService.new(app_configuration: @app_configuration)
    end

    def column_header
      multiloc_service.t(custom_field.title_multiloc)
    end

    def value_from(model)
      if scope
        model = model.public_send(scope)
        return unless model
      end
      visitor = ValueVisitor.new(model, option_index, app_configuration: @app_configuration)
      visitor.visit self
    end

    def hyperlink?
      custom_field.input_type == 'file_upload'
    end

    private

    attr_reader :custom_field, :scope, :multiloc_service, :options

    def option_index
      @option_index ||= custom_field.options.index_by(&:key)
    end
  end
end
