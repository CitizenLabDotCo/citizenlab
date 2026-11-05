# frozen_string_literal: true

module Export
  # A report column backed by a custom field: the header is the localized field
  # title and the value comes from visiting the field with the value visitor
  # (the visitor formats each input type for its export format). `scope` reads
  # the answer off an association of the input instead — e.g. :author for
  # registration fields answered on the respondent's profile. Counterpart of
  # ComputedFieldForReport; both share the #key/#column_header/#value_from/
  # #hyperlink? contract the exports iterate over.
  class CustomFieldForExport
    delegate :key, :input_type, :accept, to: :custom_field

    def initialize(custom_field, value_visitor, scope = nil)
      @custom_field = custom_field
      @scope = scope
      @value_visitor = value_visitor
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
      visitor = @value_visitor.new(model, option_index, app_configuration: @app_configuration)
      visitor.visit self
    end

    def hyperlink?
      custom_field.supports_file_upload?
    end

    private

    attr_reader :custom_field, :scope, :multiloc_service, :options

    def option_index
      @option_index ||= custom_field.ordered_transformed_options.index_by(&:key)
    end
  end
end
